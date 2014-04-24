/**
 * Ho_BootstrapAjaxCart
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the H&O Commercial License
 * that is bundled with this package in the file LICENSE_HO.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.h-o.nl/license
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to info@h-o.com so we can send you a copy immediately.
 *
 * @category    Ho
 * @package     Ho_BootstrapJAjaxCart
 * @copyright   Copyright © 2013 H&O (http://www.h-o.nl/)
 * @license     H&O Commercial License (http://www.h-o.nl/license)
 * @author      Paul Hachmang – H&O <info@h-o.nl>
 */

;(function ( $, window, document, undefined ) {
    "use strict";

    var pluginName = 'hoAjax',
        defaults = {
            template_modal:
                '<div class="modal fade" id="ho-ajax-modal" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">' +
                    '<div class="modal-dialog">' +
                        '<div class="panel panel-#{type}">' +
                            '<div class="panel-heading">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                                '<strong class="panel-title"><span>#{title}</span></strong>' +
                            '</div>' +
                            '<div class="panel-body">#{body}</div>' +
                            '<div class="panel-footer">#{footer}</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            template_alert: '<div class="alert alert-#{type}">#{message}</div>',
            message_types: {
                success: 'success',
                error:   'danger',
                notice:  'info'
            }
        },
        _blocks = {},
        _handlers = {},
        _ajaxRequestCount = {},
        _ajaxResultCount = {};

    // constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this;

        $(document).on('click', '[data-ho-ajax-link]', function(e){
            var $link = $(this),
                group = $link.data('ho-ajax-link');

            e.preventDefault();

            $link.trigger('requestStart.hoajax');
            $link.trigger('requestStartGroup.hoajax'+group);
            self.getUrl($link.attr('href'), group, function(){
                $link.button('reset');
            });
        });

        $(document).on('submit', '[data-ho-ajax-form]', function(e){
            var $form = $(this),
                url = $form.attr('action')+'?'+$form.serialize(),
                group = $form.data('ho-ajax-form');

            e.preventDefault();

            $form.trigger('requestStart.hoajax');
            $form.trigger('requestStartGroup.hoajax'+group);
            self.getUrl(url, group);
        });
    };

    /**
     * Get a URL, make sure the requests are in the right order.
     *
     * @param url
     * @param group
     * @param callback
     */
    Plugin.prototype.getUrl = function(url, group, callback) {
        var self = this;
        if (! _ajaxRequestCount[group]) {
            _ajaxRequestCount[group] = 0;
            _ajaxResultCount[group] = 0;
        }
        var ajaxRequestNumber = ++_ajaxRequestCount[group];
        new EasyAjax.Request(url, {
            method: 'get',
            action_content: Object.keys(this.getBlocks(group)),
            onComplete: function(transport){
                //when the request is complete, we need to make sure the result is newer than the
                //currently pending requests. Some requests take longer than others therefor
                //sometimes an older request is returned later than a newer.
                //we give each request a number and check if it is higher than the already
                //rendered requests
                if (ajaxRequestNumber > _ajaxResultCount[group]) { //check if it is newer
                    _ajaxResultCount[group] = ajaxRequestNumber; //set the current request as newest
                    $(document).trigger('responseStart.hoajax');
                    $(document).trigger('responseStartGroup.hoajax.'+group);

                    self._processResponse(transport, group);

                    if (callback != undefined) {
                        callback.call(self);
                    }

                    $(document).trigger('responseFinish.hoajax');
                    $(document).trigger('responseFinishGroup.hoajax.'+group);
                } else {
                    $(document).trigger('responseSkip.hoajax');
                    $(document).trigger('responseSkipGroup.hoajax.'+group);
                }
            },
            onException: function(ajax) {
                if (ajax.transport.statusText) {
                    var messages = [{code: ajax.transport.statusText, type: 'error', body: ajax.transport.responseText}];
                    self._renderModal(messages);
                }
            },
            onFailure: function(ajax) {
                console.log('faail');
            }
        });
    }

    Plugin.prototype.setAjaxRequestNumber = function(group, number) {
        return _ajaxRequestCount[group] = number;
    }

    Plugin.prototype.getAjaxRequestCount = function(group) {
        return _ajaxRequestCount[group]
    }

    Plugin.prototype.getBlocks = function (group) {
        _blocks = {}
        $('[data-ho-ajax]').each(function () {
            _blocks[$(this).data('ho-ajax')] = $(this);
        });

        if (group == undefined) {
            return _blocks;
        }

        var _resultBlocks = {};
        $.each(_blocks, function(index, element){
            var elementGroup = $(element).data('ho-ajax-group');
            if (elementGroup == undefined || elementGroup == group) {
                _resultBlocks[index] = element;
            }
        });

        return _resultBlocks;
    };

    Plugin.prototype.getBlock = function(blockName) {
        return this.getBlocks()[blockName];
    }

    Plugin.prototype._processResponse = function(transport, group) {
        if (transport.responseJSON.action_content_data != undefined) {
            this._updateBlocks(transport.responseJSON.action_content_data);
        }

        if (transport.responseJSON.messages) {
            this._renderModal(transport.responseJSON.messages);
        }
    }

    Plugin.prototype._updateBlocks = function(content) {
        $.each(this.getBlocks(), function (blockName, element) {
            if (content[blockName] != undefined) {
                var blockContent = content[blockName].replace(/(\r\n|\n|\r)/gm,"");
                var $block = $(blockContent);
                element.replaceWith($block);
                $(document).trigger('responseFinishBlock.hoajax.'+blockName);
            }
        });
    }

    // Render the modal with all the messages
    Plugin.prototype._renderModal = function(messages) {
        if (messages.length <= 0) {
            return;
        }

        var template = new Template(this.options.template_modal);
        var self = this;
        var data = {
            title: '',
            type: '',
            body: '',
            footer: ''
        }

        if (messages.length == 1) {
            data.title += messages[0].code;
            data.type = this.options.message_types[messages[0].type]
                        ? this.options.message_types[messages[0].type]
                        : messages[0].type;
            if (messages[0].body) data.body = messages[0].body;
        } else {
            $.each(messages, function(){
                data.body += self._renderAlert(this.code, this.type);
            });
        }


        var modal = $(template.evaluate(data));
        $('body').append(modal);
        modal.modal('show');
    }

    Plugin.prototype._renderAlert = function(message, type) {
        var template = new Template(this.options.template_alert);
        return template.evaluate({
            'message': message,
            'type': type
        });
    }

    // You don't need to change something below:
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            return returns !== undefined ? returns : this;
        }
    };

}(jQuery, window, document));


jQuery(function ($) {
    $(document).hoAjax();

    // There are different Ajax groups that update different parts of the page, for example 'cart'
    // only updates the cart, but doesn't update other parts.


    $(document).on('hoajax.group.cart', function (e) {
        var $cart = this.getBlock('cart_header');
        $cart.children('a').dropdown('toggle');
    });
});
