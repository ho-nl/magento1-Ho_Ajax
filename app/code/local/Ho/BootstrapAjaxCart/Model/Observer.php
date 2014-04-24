<?php
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
 * @package     Ho_BootstrapAjaxCart
 * @copyright   Copyright © 2014 H&O (http://www.h-o.nl/)
 * @license     H&O Commercial License (http://www.h-o.nl/license)
 * @author      Paul Hachmang – H&O <info@h-o.nl>
 */
 
class Ho_BootstrapAjaxCart_Model_Observer
{
    /**
     * @event controller_response_redirect
     * @param Varien_Event_Observer $event
     */
    public function handleRedirect(Varien_Event_Observer $event) {
        $core = $this->_getCore();
        if ($core->isHoAjax() && !$core->isProceed()) {
            $core->setProceed();

            $response = Mage::getModel('ho_bootstrapajaxcart/response');
            $response->handleRedirect($this->_prepareRedirectUrl($event->getTransport()->getUrl()));
            $response->sendResponse();
        }
    }

    protected function _prepareRedirectUrl($url) {
        /** @var Mage_Core_Helper_Url $urlHelper */
        $urlHelper = Mage::helper('core/url');
        $url = rawurldecode($url);
        $url = rawurldecode($url);
        $url = $urlHelper->removeRequestParam($url, 'blocks[]');
        $url = $urlHelper->removeRequestParam($url, 'ho_ajax');
        $url = $urlHelper->removeRequestParam($url, 'redirect');
        return $url;
    }

    /**
     * Add Json to response instead of default data
     * @event controller_action_layout_render_before
     */
    public function getJson(Varien_Event_Observer $event) {
        $core = $this->_getCore();
        if ($core->isHoAjax() && !$core->isProceed()) {
            $core->setProceed();
            /** @var $response VF_EasyAjax_Model_Response */
            $response = Mage::getModel('ho_bootstrapajaxcart/response');

            $response->loadContent(
                (array) Mage::app()->getRequest()->getParam('blocks', array())
            );
            $response->sendResponse();
        }
    }


    public function prepareRedirect() {
        var_dump('uea');exit;
    }

    /**
     * Add ho_ajax handles
     * @event controller_action_layout_load_before
     * @param Varien_Event_Observer $event
     */
    public function addHandles(Varien_Event_Observer $event) {
        if (! $core = $this->_getCore()->isHoAjax()) {
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
                $update->addHandle('ho_ajax_'.$fullActionName);
            }
        }
    }


    /**
     * @return Ho_BootstrapAjaxCart_Model_Core
     */
    protected function _getCore() {
        return Mage::getSingleton('ho_bootstrapajaxcart/core');
    }
}