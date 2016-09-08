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

/**
 * @method $this setBlocks(array $blocks);
 * @method array getBlocks();
 */
class Ho_BootstrapAjaxCart_Model_Response extends Varien_Object
{
    /**
     * @return Zend_Controller_Response_Http
     */
    public function prepareResponse()
    {
        $response = Mage::app()->getResponse();
        $response->clearHeaders();
        $response->setHeader('Content-Type', 'application/json');
        $response->clearBody();
        $response->setBody($this->toJson());
        return $response;
    }

    /**
     * Send response to browser with json content type
     * @param Zend_Controller_Response_Http $response
     */
    public function sendResponse(Zend_Controller_Response_Http $response)
    {
        $response->sendResponse();
        exit(0);
    }


    /**
     * @param $url
     */
    public function handleRedirect($url) {
        $this->setData('redirect', $url);
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

        $key = array_search('ho.bootstrapajaxcart.messages', $blockNames);
        if ($key) {
            unset($blockNames[$key]);
            array_unshift($blockNames, 'ho.bootstrapajaxcart.messages');
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
