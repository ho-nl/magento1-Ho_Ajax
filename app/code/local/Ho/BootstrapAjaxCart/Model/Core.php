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

class Ho_BootstrapAjaxCart_Model_Core
{
    /**
     * is ho ajax request
     * @var bool
     */
    protected $_isHoAjax = null;

    /**
     * Is ho ajax event processed
     * @var bool
     */
    protected $_proceed = false;


    /**
     * Is ho Ajax Request
     * @return bool
     */
    public function isHoAjax()
    {
        if ($this->_isHoAjax === null) {
            $this->_isHoAjax = Mage::app()->getRequest()->isXmlHttpRequest()
                            && Mage::app()->getRequest()->getParam('ho_ajax', false);
        }
        return (bool) $this->_isHoAjax;
    }

    /**
     * Set that is ho ajax request or not
     * @param bool $value
     */
    public function setHoAjax($value = true)
    {
        $this->_isHoAjax = (bool) $value;
    }

    /**
     * Is event processed
     * @return bool
     */
    public function isProceed()
    {
        return (bool) $this->_proceed;
    }

    /**
     * Set that event processed
     * @return $this
     */
    public function setProceed()
    {
        $this->_proceed = true;
        return $this;
    }

}
