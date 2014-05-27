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
 *
 * 
 */

class Ho_BootstrapAjaxCart_Block_Messages extends Mage_Core_Block_Template
{
    protected static $_messageMap = array(
        'error'   => 'danger',
        'warning' => 'warning',
        'notice'  => 'info',
        'success' => 'success'
    );
    public function getMessages() {
        $messagesBlock = $this->getMessagesBlock();
        $messages = $messagesBlock->getMessages();
        $messagesBlock->getMessageCollection()->clear();
        return $messages;
    }

    public function getMessageCssClass(Mage_Core_Model_Message_Abstract $message) {
        if (isset(self::$_messageMap[$message->getType()])) {
            return self::$_messageMap[$message->getType()];
        }

        return $message->getType();
    }
}
