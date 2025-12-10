// Pinia store for loot vouchers using Supabase

import { defineStore } from 'pinia'
import type { LootVoucher, LootVoucherFormData, LootRarity } from '~/types'
import { useSupabaseClient } from '~/lib/supabase.client'

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
    async initialize() {
      await this.fetchVouchers()
    },

    /**
     * Fetch all vouchers from Supabase
     */
    async fetchVouchers() {
      const supabase = useSupabaseClient()
      this.loading = true

      try {
        const { data, error } = await supabase
          .from('loot_vouchers')
          .select('*')
          .order('awarded_at', { ascending: false })

        if (error) throw error

        this.vouchers = data as LootVoucher[]
      } catch (error: any) {
        console.error('Error fetching loot vouchers:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Award a loot voucher (DM action)
     */
    async awardVoucher(dmId: string, formData: LootVoucherFormData): Promise<LootVoucher> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('loot_vouchers')
          .insert({
            characterId: formData.characterId,
            name: formData.name,
            description: formData.description,
            rarity: formData.rarity,
            isUsed: false,
            awardedBy: dmId
          })
          .select()
          .single()

        if (error) throw error

        const newVoucher = data as LootVoucher

        // Add to local state
        this.vouchers.push(newVoucher)

        return newVoucher
      } catch (error: any) {
        console.error('Error awarding voucher:', error)
        throw new Error(error.message || 'Failed to award loot voucher')
      }
    },

    /**
     * Mark voucher as used
     */
    async useVoucher(voucherId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('loot_vouchers')
          .update({
            isUsed: true,
            usedAt: new Date().toISOString()
          })
          .eq('id', voucherId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.vouchers.findIndex(v => v.id === voucherId)
        if (index !== -1) {
          this.vouchers[index] = data as LootVoucher
        }

        return true
      } catch (error: any) {
        console.error('Error using voucher:', error)
        return false
      }
    },

    /**
     * Mark voucher as unused (undo use)
     */
    async unuseVoucher(voucherId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('loot_vouchers')
          .update({
            isUsed: false,
            usedAt: null
          })
          .eq('id', voucherId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.vouchers.findIndex(v => v.id === voucherId)
        if (index !== -1) {
          this.vouchers[index] = data as LootVoucher
        }

        return true
      } catch (error: any) {
        console.error('Error unusing voucher:', error)
        return false
      }
    },

    /**
     * Delete voucher (admin only)
     */
    async deleteVoucher(voucherId: string): Promise<boolean> {
      const supabase = useSupabaseClient()

      try {
        const { error } = await supabase
          .from('loot_vouchers')
          .delete()
          .eq('id', voucherId)

        if (error) throw error

        // Remove from local state
        this.vouchers = this.vouchers.filter(v => v.id !== voucherId)

        return true
      } catch (error: any) {
        console.error('Error deleting voucher:', error)
        return false
      }
    },

    /**
     * Delete all vouchers for a character
     */
    async deleteVouchersByCharacter(characterId: string): Promise<number> {
      const supabase = useSupabaseClient()

      try {
        const { data, error } = await supabase
          .from('loot_vouchers')
          .delete()
          .eq('characterId', characterId)
          .select()

        if (error) throw error

        // Remove from local state
        this.vouchers = this.vouchers.filter(v => v.characterId !== characterId)

        return data?.length || 0
      } catch (error: any) {
        console.error('Error deleting character vouchers:', error)
        return 0
      }
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
