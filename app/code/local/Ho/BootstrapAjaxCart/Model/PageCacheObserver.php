<?php
/**
 * Copyright (c) 2016 H&O E-commerce specialisten B.V. (http://www.h-o.nl/)
 * See LICENSE.txt for license details.
 */

if (class_exists('Meanbee_Footerjs_Model_PageCache_Observer', true)) {
    class Ho_BootstrapAjaxCart_Model_PageCacheObserver_Extend extends Meanbee_Footerjs_Model_PageCache_Observer {}
} else {
    class Ho_BootstrapAjaxCart_Model_PageCacheObserver_Extend extends Enterprise_PageCache_Model_Observer {}
}

class Ho_BootstrapAjaxCart_Model_PageCacheObserver extends Ho_BootstrapAjaxCart_Model_PageCacheObserver_Extend
{

    /**
     * Save page body to cache storage
     *
     * @param Varien_Event_Observer $observer
     * @return Enterprise_PageCache_Model_Observer
     */
    public function cacheHoAjaxResponse($request, $response)
    {
        if (!$this->isCacheEnabled()) {
            return $this;
        }

        $this->_saveDesignException();
        $this->_checkAndSaveSslOffloaderHeaderToCache();

        $this->_processor->processRequestResponse($request, $response);
        return $this;
    }
}