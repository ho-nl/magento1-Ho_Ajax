<?php

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
class Ho_BootstrapAjaxCart_Model_Observer
{
    /**
     * @event controller_response_redirect
     * @param Varien_Event_Observer $event
     */
    public function handleRedirect(Varien_Event_Observer $event)
    {
        $core = $this->_getCore();
        if ($core->isHoAjax() && !$core->isProceed()) {
            $core->setProceed();

            /** @var Ho_BootstrapAjaxCart_Model_Response $ajaxResponse */
            $ajaxResponse = Mage::getModel('ho_bootstrapajaxcart/response');
            $ajaxResponse->handleRedirect($this->_prepareRedirectUrl($event->getTransport()->getUrl()));

            // If not logged in show a message for the ajax login
            if (!Mage::getSingleton('customer/session')->isLoggedIn()) {
                $ajaxResponse->setData('message', Mage::helper('customer')->__('Invalid login or password.'));
                $ajaxResponse->setData('title', Mage::helper('ho_bootstrapajaxcart')->__('Login'));
            }
            $ajaxResponse->sendResponse($ajaxResponse->prepareResponse());
        }
    }

    protected function _prepareRedirectUrl($url)
    {
        /** @var Mage_Core_Helper_Url $urlHelper */
        $urlHelper = Mage::helper('core/url');
        $url = rawurldecode($url);
        $url = rawurldecode($url);
        $url = $urlHelper->removeRequestParam($url, 'blocks[]');
        $url = $urlHelper->removeRequestParam($url, 'ho_ajax');
        $url = $urlHelper->removeRequestParam($url, 'redirect');
        $url = $urlHelper->removeRequestParam($url, '_');
        return $url;
    }

    /**
     * Add Json to response instead of default data
     * @event controller_action_layout_render_before
     */
    public function getJson(Varien_Event_Observer $event)
    {
        $core = $this->_getCore();
        if (!$core->isHoAjax() || $core->isProceed()) {
            return ;
        }

        $core->setProceed();

        /** @var $ajaxResponse Ho_BootstrapAjaxCart_Model_Response */
        $ajaxResponse = Mage::getModel('ho_bootstrapajaxcart/response');

        $ajaxResponse->loadContent(
            (array)Mage::app()->getRequest()->getParam('blocks', array())
        );

        $response = $ajaxResponse->prepareResponse();

        if (Mage::helper('core')->isModuleEnabled('Enterprise_PageCache')) {
            $pageCacheObserver = Mage::getSingleton('enterprise_pagecache/observer');
            $pageCacheObserver->cacheHoAjaxResponse(Mage::app()->getRequest(), $response);
        }

        $ajaxResponse->sendResponse($response);
    }

    /**
     * Add ho_ajax handles
     * @event controller_action_layout_load_before
     * @param Varien_Event_Observer $event
     */
    public function addHandles(Varien_Event_Observer $event)
    {
        if (!$core = $this->_getCore()->isHoAjax()) {
            return;
        }

        /** @var Mage_Core_Model_Layout_Update $update */
        $update = $event->getLayout()->getUpdate();
        $request = Mage::app()->getRequest();
        $handles = $update->getHandles();
        $update->resetHandles();

        // load action handle
        $fullActionName = strtolower(
            $request->getRequestedRouteName() . '_' .
            $request->getRequestedControllerName() . '_' .
            $request->getRequestedActionName()
        );

        foreach ($handles as $handle) {
            $update->addHandle($handle);
            if ($handle == 'default') {
                $update->addHandle('ho_ajax');
            }

            if ($handle == $fullActionName) {
                $update->addHandle('ho_ajax_' . $fullActionName);
            }
        }
    }


    /**
     * @return Ho_BootstrapAjaxCart_Model_Core
     */
    protected function _getCore()
    {
        return Mage::getSingleton('ho_bootstrapajaxcart/core');
    }
}