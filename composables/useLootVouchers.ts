// Loot vouchers composable

import { useLootVouchersStore } from '~/stores/lootVouchers'
import { useAuthStore } from '~/stores/auth'
import type { LootVoucherFormData } from '~/types'

export const useLootVouchers = () => {
  const lootStore = useLootVouchersStore()
  const authStore = useAuthStore()

  // Initialize store on first use
  if (lootStore.vouchers.length === 0) {
    lootStore.initialize()
  }

  /**
   * Award loot voucher (DM/Admin only)
   */
  const awardVoucher = (formData: LootVoucherFormData) => {
    const currentUser = authStore.currentUser

    if (!currentUser) {
      throw new Error('Must be logged in')
    }

    if (currentUser.role !== 'dm' && currentUser.role !== 'admin') {
      throw new Error('Only DMs and Admins can award loot vouchers')
    }

    return lootStore.awardVoucher(currentUser.id, formData)
  }

  /**
   * Get vouchers for a specific character
   */
  const getCharacterVouchers = (characterId: string) => {
    return lootStore.getVouchersByCharacterId(characterId)
  }

  /**
   * Get unused vouchers for a character
   */
  const getUnusedVouchers = (characterId: string) => {
    return lootStore.getUnusedVouchersByCharacterId(characterId)
  }

  /**
   * Get used vouchers for a character
   */
  const getUsedVouchers = (characterId: string) => {
    return lootStore.getUsedVouchersByCharacterId(characterId)
  }

  return {
    // State
    allVouchers: computed(() => lootStore.allVouchers),
    recentVouchers: computed(() => lootStore.recentVouchers),
    loading: computed(() => lootStore.loading),
    error: computed(() => lootStore.error),

    // Actions
    awardVoucher,
    useVoucher: lootStore.useVoucher,
    unuseVoucher: lootStore.unuseVoucher,
    deleteVoucher: lootStore.deleteVoucher,
    getCharacterVouchers,
    getUnusedVouchers,
    getUsedVouchers,
    getVoucherCount: lootStore.getVoucherCount,
    getVouchersByRarity: lootStore.getVouchersByRarity
  }
}
