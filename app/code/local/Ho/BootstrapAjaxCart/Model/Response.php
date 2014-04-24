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

/**
 * @method $this setBlocks(array $blocks);
 * @method array getBlocks();
 */
class Ho_BootstrapAjaxCart_Model_Response extends Varien_Object
{
    /**
     * Send response to browser with json content type
     */
    public function sendResponse()
    {
        $response = Mage::app()->getResponse();
        $response->clearHeaders();
        $response->setHeader('Content-Type', 'application/json');
        $response->clearBody();
        $response->setBody($this->toJson());
        $response->sendResponse();
        exit;
    }

    public function handleRedirect($url) {
        $this->setRedirect($url);
    }


    /**
     * Get the block's HTML
     * @param $blockNames
     */
    public function loadContent($blockNames)
    {
        if (! is_array($blockNames) && count($blockNames) <= 0) {
            return;
        }

        $layout = Mage::app()->getLayout();
        $handles = $layout->getUpdate()->getHandles();

        $blocks = array();
        foreach ($blockNames as $blockName) {
            $block = $layout->getBlock($blockName);
            if (! $block) {
                continue;
            }

            $blocks[$blockName] = $block->toHtml();
        }

        $this->setBlocks($blocks);
    }
}
