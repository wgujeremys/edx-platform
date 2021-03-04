"""
This module contains various configuration settings via
waffle switches for the Certificates app.
"""


from edx_toggles.toggles import LegacyWaffleSwitchNamespace

# Namespace
WAFFLE_NAMESPACE = 'certificates'

# Switches
AUTO_CERTIFICATE_GENERATION = 'auto_certificate_generation'


def waffle():
    """
    Returns the namespaced, cached, audited Waffle class for Certificates.
    """
    return LegacyWaffleSwitchNamespace(name=WAFFLE_NAMESPACE, log_prefix='Certificates: ')
