<?php

class Dhmedia_Devel_Helper_Auth extends Mage_Core_Helper_Abstract
{
	public function allowDevel()
	{
		/*
		 * If there are IP restictions, check remote IP against them.
		 * Deny if IP is restricted.
		 */
		$restrictedIpString = Mage::app()->getStore()->getConfig('dev/restrict/allow_ips');
		if ($restrictedIpString) {
			$restrictedIps = explode(',', str_replace(' ','', $restrictedIpString));
			if (! in_array(Mage::app()->getRequest()->getServer('REMOTE_ADDR'), $restrictedIps)) {
				return false;
			}
		}

		/*
		 * If developer mode is on, allow now.
		 */
		if (Mage::getIsDeveloperMode()) {
			return true;
		}
		
		/*
		 * Check permissions
		 * 
		 * @todo If has permission, allow now.
		 */
		
		/*
		 * Default to Off/Deny
		 */
		return false;
	}
}