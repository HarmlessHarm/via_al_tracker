// Pinia store for loot vouchers

import { defineStore } from 'pinia'
import type { LootVoucher, LootVoucherFormData, LootRarity } from '~/types'
import { getStorageItem, setStorageItem, StorageKeys } from '~/utils/storage'
import { generateFixtureLootVouchers } from '~/utils/fixtures'

export const useLootVouchersStore = defineStore('lootVouchers', {
  state: () => ({
    vouchers: [] as LootVoucher[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    /**
     * Get vouchers by character ID
     */
    getVouchersByCharacterId: (state) => {
      return (characterId: string): LootVoucher[] => {
        return state.vouchers
          .filter(v => v.characterId === characterId)
          .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
      }
    },

    /**
     * Get unused vouchers by character ID
     */
    getUnusedVouchersByCharacterId: (state) => {
      return (characterId: string): LootVoucher[] => {
        return state.vouchers
          .filter(v => v.characterId === characterId && !v.isUsed)
          .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
      }
    },

    /**
     * Get used vouchers by character ID
     */
    getUsedVouchersByCharacterId: (state) => {
      return (characterId: string): LootVoucher[] => {
        return state.vouchers
          .filter(v => v.characterId === characterId && v.isUsed)
          .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
      }
    },

    /**
     * Get vouchers by rarity
     */
    getVouchersByRarity: (state) => {
      return (characterId: string, rarity: LootRarity): LootVoucher[] => {
        return state.vouchers
          .filter(v => v.characterId === characterId && v.rarity === rarity)
          .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
      }
    },

    /**
     * Get all vouchers (for admin/DM views)
     */
    allVouchers: (state): LootVoucher[] => {
      return state.vouchers.sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
    },

    /**
     * Get recent vouchers (last 10)
     */
    recentVouchers: (state): LootVoucher[] => {
      return state.vouchers
        .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
        .slice(0, 10)
    }
  },

  actions: {
    /**
     * Initialize loot vouchers store
     */
    initialize() {
      const storedVouchers = getStorageItem<LootVoucher[]>(StorageKeys.LOOT_VOUCHERS)

      if (storedVouchers && storedVouchers.length > 0) {
        this.vouchers = storedVouchers
      } else {
        // First time - load fixtures
        this.vouchers = generateFixtureLootVouchers()
        setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)
      }
    },

    /**
     * Award a loot voucher (DM action)
     */
    awardVoucher(dmId: string, formData: LootVoucherFormData): LootVoucher {
      const now = new Date().toISOString()

      const newVoucher: LootVoucher = {
        id: `loot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        characterId: formData.characterId,
        name: formData.name,
        description: formData.description,
        rarity: formData.rarity,
        isUsed: false,
        awardedBy: dmId,
        awardedAt: now
      }

      this.vouchers.push(newVoucher)
      setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)

      return newVoucher
    },

    /**
     * Mark voucher as used
     */
    useVoucher(voucherId: string): boolean {
      const voucher = this.vouchers.find(v => v.id === voucherId)

      if (!voucher || voucher.isUsed) return false

      voucher.isUsed = true
      voucher.usedAt = new Date().toISOString()

      setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)

      return true
    },

    /**
     * Mark voucher as unused (undo use)
     */
    unuseVoucher(voucherId: string): boolean {
      const voucher = this.vouchers.find(v => v.id === voucherId)

      if (!voucher || !voucher.isUsed) return false

      voucher.isUsed = false
      voucher.usedAt = undefined

      setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)

      return true
    },

    /**
     * Delete voucher (admin only)
     */
    deleteVoucher(voucherId: string): boolean {
      const voucherIndex = this.vouchers.findIndex(v => v.id === voucherId)

      if (voucherIndex === -1) return false

      this.vouchers.splice(voucherIndex, 1)
      setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)

      return true
    },

    /**
     * Delete all vouchers for a character
     */
    deleteVouchersByCharacter(characterId: string): number {
      const initialLength = this.vouchers.length
      this.vouchers = this.vouchers.filter(v => v.characterId !== characterId)

      setStorageItem(StorageKeys.LOOT_VOUCHERS, this.vouchers)

      return initialLength - this.vouchers.length
    },

    /**
     * Get voucher count by character
     */
    getVoucherCount(characterId: string): { total: number; unused: number; used: number } {
      const charVouchers = this.vouchers.filter(v => v.characterId === characterId)

      return {
        total: charVouchers.length,
        unused: charVouchers.filter(v => !v.isUsed).length,
        used: charVouchers.filter(v => v.isUsed).length
      }
    }
  }
})
