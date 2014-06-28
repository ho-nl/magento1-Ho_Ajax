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
