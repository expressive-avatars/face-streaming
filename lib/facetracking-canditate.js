import { injectDependency, isValidAvatar } from './utils'
import './facetracking-target'

/**
 * Tests if an avatar is suitable for facetracking.
 * If so, it attaches the facetracking-target component.
 */
AFRAME.registerComponent('facetracking-candidate', {
  init: function () {
    const avatarRootEl = this.el

    if (isValidAvatar(avatarRootEl)) {
      const networkedEl = avatarRootEl.closest('[networked]')
      const networkId = NAF.utils.getNetworkId(networkedEl)
      avatarRootEl.setAttribute('facetracking-target', { networkId })
    }
  },
})

// Make the facetracking-canditate component automatically attach to all avatars
injectDependency('ik-controller', 'facetracking-candidate')
