/**
 * Ho_BootstrapAjaxCart
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * @category    Ho
 * @package     Ho_BootstrapAjaxCart
 * @copyright   Copyright © 2014 H&O (http://www.h-o.nl/)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 * @author      Paul Hachmang – H&O <info@h-o.nl>
 */

;jQuery.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    jQuery.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/**
 * Admin panel uses varienForm instead of VarienForm
 */
var varienFormClass
if (typeof VarienForm == "undefined"){
    varienFormClass = varienForm;
} else {
    varienFormClass = VarienForm;
}

varienFormClass.prototype.submit = function (url){
    if(this.validator && this.validator.validate()){
        var $form = jQuery(this.form);
        if ($form.data('ho-ajax-form') != undefined) {
            $form.trigger('requestInit.hoajax');
        } else if (this.form != undefined)  {
            this.form.submit();
        } else {
            this.adminSubmit();
        }
    }
}

varienFormClass.prototype.adminSubmit =function(url){
    if (typeof varienGlobalEvents != undefined) {
        varienGlobalEvents.fireEvent('formSubmit', this.formId);
    }
    this.errorSections = $H({});
    this.canShowError = true;
    this.submitUrl = url;
    if(this.validator && this.validator.validate()){
        if(this.validationUrl){
            this._validate();
        }
        else{
            this._submit();
        }
        return true;
    }
    return false;
};

HO_AJAX_AVAILABLE = true;
(function ( $, window, document, undefined ) {
    "use strict";

    var defaults = {
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
                '</div>'
        },
        _blocks = {},
        _ajaxRequestCount = {},
        _ajaxResultCount = {};

    // constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;

        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this;

        $(document).on('click', '[data-ho-ajax-link]', function(e){
            var $link = $(this),
                group = $link.data('ho-ajax-link');

            if($link.hasClass('btn-confirm')){
                var msg = $link.data('confirm-text');
                var confirm = window.confirm(msg ? msg : Translator.translate('Are you sure?'));
                if (! confirm) {
                    e.stopPropagation();
                    return false;
                }
            }

            if (typeof $link.button == 'function' && $link.data('loading-text')) {
                $link.button('loading');
            }

            e.preventDefault();

            $link.trigger('requestStart.hoajax', [$link]);
            $link.trigger('requestStartGroup.hoajax.'+group, [$link]);
            self.getUrl($link.attr('href'), group, 'GET', {}, function(){
                if (typeof $link.button == 'function') {
                    $link.button('reset');
                }
            });
        });

        $(document).on('submit requestInit.hoajax', '[data-ho-ajax-form]', function(e){
            var $form = $(this),
                data = $form.serializeObject(),
                url = $form.attr('action'),
                group = $form.data('ho-ajax-form'),
                button = $form.find('.btn');

            e.preventDefault();

            $form.trigger('requestStart.hoajax', [$form]);
            $form.trigger('requestStartGroup.hoajax.'+group, [$form]);
            self.getUrl(url, group, 'POST', data, function(){
                if (typeof button.button == 'function' && button.hasClass('btn')) {
                    button.button('reset');
                }
            });
            return false;
        });
    };

    /**
     * Get a URL, and update the page
     *
     * When the request is complete, we need to make sure the result is newer than the currently
     * pending requests. Some requests take longer than others therefor sometimes an older request
     * is returned later than a newer. We give each request a number and check if it is higher than
     * the already rendered requests.
     *
     * @param url string
     * @param group string
     * @param data object
     * @param type string
     * @param callback function
     */
    Plugin.prototype.getUrl = function(url, group, type, data, callback) {
        var self = this;

        url = url || document.URL;

        if (! group) {
            throw new Error('Can\'t retrieve URL when there is no group specified');
        }

        if (url.indexOf('https') !== document.URL.indexOf('https')) {
            window.location = url;
            return;
        }

        //Update request count
        if (! _ajaxRequestCount[group]) {
            _ajaxRequestCount[group] = 0;
            _ajaxResultCount[group] = 0;
        }
        var ajaxRequestNumber = ++_ajaxRequestCount[group];


        var decodedUri = decodeURI(url);
        if (decodedUri.indexOf("no_cache") == -1 && decodedUri.indexOf("allow_cache") == -1) {
            var key = decodeURI(url).indexOf("?") < 0 ? '?' : '&';
            url = url + key + 'no_cache=1'
        }

        var requestData = {
            type: type,
            url: url,
            data: $.extend( data, {
                ho_ajax: 1,
                blocks: Object.keys(this.getBlocks(group))
            }),
            dataType: 'json',
            cache: false
        };

        var request = $.ajax(requestData);

        request.done(function(data) {
            if (ajaxRequestNumber > _ajaxResultCount[group]) { //check if it is newer
                _ajaxResultCount[group] = ajaxRequestNumber; //set the current request as newest

                if (data.redirect != undefined) {
                    self.getUrl(data.redirect, group, type, data, callback);
                    return;
                } else {
                    self._processResponse(group, data, requestData);
                }
            } else {
                self._processResponseSkipped(group, data);
            }

            if (callback != undefined) {
                callback.call(self);
            }
        });

        request.fail(function(jqxhr) {
            // Aborted request.
            if (jqxhr.status === 0) {
                return;
            }

            self._processResonseFail(jqxhr);
        });
    };

    Plugin.prototype._processResponse = function(group, data, requestData) {
        $(document).trigger('responseStart.hoajax');
        $(document).trigger('responseStartGroup.hoajax.'+group);

        this._updateBlocks(group, data.blocks);

        $(document).trigger('responseFinish.hoajax');
        $(document).trigger('responseFinishGroup.hoajax.'+group);

    };

    Plugin.prototype._processResponseSkipped = function(group, data){
        $(document).trigger('responseSkip.hoajax');
        $(document).trigger('responseSkipGroup.hoajax.'+group);
    };

    Plugin.prototype._processResonseFail = function(jqxhr){
        this._renderError('An Error Occurred', jqxhr.responseText);
    };

    Plugin.prototype.refreshPage = function(group, data) {
        this.getUrl(document.URL, group, 'GET', data);
    };


    Plugin.prototype.getBlocks = function (group) {
        if (group == undefined) {
            _blocks = {};

            $('[data-ho-ajax]').each(function () {
                _blocks[$(this).data('ho-ajax')] = $(this);
            });

            return _blocks;
        }

        var _resultBlocks = {};
        $('[data-ho-ajax]').each(function () {
            var $this = $(this);
            var _gr = $this.data('ho-ajax-group');
            var elementGroup = _gr ? _gr.split(" ") : [];

            if (elementGroup == undefined
                || $.inArray(group, elementGroup) >= 0
                || $.inArray('all', elementGroup) >= 0) {
                _resultBlocks[$this.data('ho-ajax')] = $this;
            }
        });

        return _resultBlocks;
    };

    Plugin.prototype.getBlock = function(blockName) {
        return this.getBlocks()[blockName];
    };

    Plugin.prototype._updateBlocks = function(group, content) {
        $.each(this.getBlocks(group), function (blockName, element) {
            if (content[blockName] != undefined) {
                var blockContent = $(content[blockName].replace(/(\r\n|\n|\r)/gm,""));

                $(document).trigger('responseFinishBlockPrepare.hoajax.'+blockName, blockContent);
                $('[data-ho-ajax="'+blockName+'"]').each(function(){
                    var $this = $(this);
                    var _gr = $this.data('ho-ajax-group');
                    var elementGroup = _gr ? _gr.split(" ") : [];

                    if (elementGroup == undefined
                        || $.inArray(group, elementGroup) >= 0
                        || $.inArray('all', elementGroup) >= 0) {
                        $(this).replaceWith(blockContent);
                        blockContent = blockContent.clone();
                    }
                });
                $(document).trigger('responseFinishBlock.hoajax.'+blockName);
            }
        });
    };

    // Render the modal with all the messages
    Plugin.prototype._renderError = function(title, message) {
        var template = new Template(this.options.template_modal);
        var self = this;
        var data = {
            title: title,
            type: 'danger',
            body: message,
            footer: ''
        };

        var modal = $(template.evaluate(data));
        //if the modal is closed, we can safely remove it.
        modal.on('hidden.bs.modal', function(){
            modal.remove();
        });

        $('body').append(modal);
        modal.modal('show');
    };

    // MODAL PLUGIN DEFINITION
    // =======================
    $.fn.hoAjax = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_hoAjax')) {
                    $.data(this, 'plugin_hoAjax', new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_hoAjax');

                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                if (options === 'destroy') {
                  $.data(this, 'plugin_hoAjax', null);
                }
            });

            return returns !== undefined ? returns : this;
        }
    };

}(jQuery, window, document));

jQuery(function ($) {
    //initialize the module, start watching URL's
    $(document).hoAjax();

    $(document).on('responseFinishBlock.hoajax.ho.bootstrapajaxcart.messages', function(){
        $('.alert-overlay').find('>div').each(function(){
            var _this = this;
            setTimeout(function(){
                $(_this).alert('close');
            }, 8000);
        });
    });
});

