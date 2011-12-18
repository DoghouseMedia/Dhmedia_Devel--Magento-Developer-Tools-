<?php

class Dhmedia_Devel_Helper_Auth extends Mage_Core_Helper_Abstract
{
	public function allowDevel()
	{
		/*
		 * If there are IP restictions, check remote IP against them.
		 * Deny if IP is restricted.
		 * 
		 * We don't automatically allow unless the admin setting tells us
		 * to allow for valid IPs. If no IPs are set in the admin, we do NOT
		 * allow automatically.
		 */
		$restrictedIpString = Mage::app()->getStore()->getConfig('dev/restrict/allow_ips');
		if ($restrictedIpString) {
			$restrictedIps = explode(',', str_replace(' ','', $restrictedIpString));
			if (in_array(Mage::app()->getRequest()->getServer('REMOTE_ADDR'), $restrictedIps)) {
				/*
				 * Only return true if the admin setting allows valid ip only.
				 * Else, a valid IP will still need developerMode to be on.
				 */
				if (Mage::app()->getStore()->getConfig('dev/dhmedia_devel/allow_valid_ip_only')) {
					return true;
				}
			}
			else {
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