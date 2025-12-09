<template>
  <div class="card bg-base-100 shadow-xl hover:shadow-2xl smooth-transition cursor-pointer" @click="goToCharacter">
    <div class="card-body">
      <h2 class="card-title">
        {{ character.name }}
        <div class="badge level-badge badge-primary">Lvl {{ character.totalLevel }}</div>
      </h2>

      <p class="text-sm text-base-content/70">
        {{ character.race }} | {{ character.background }}
      </p>

      <div class="flex flex-wrap gap-1 mt-2">
        <div
          v-for="(cls, index) in character.classes"
          :key="index"
          class="badge badge-outline"
        >
          {{ cls.class }} {{ cls.level }}
        </div>
      </div>

      <div class="divider my-2"></div>

      <div class="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <div class="font-bold text-warning">{{ character.gold }}</div>
          <div class="text-xs text-base-content/60">Gold</div>
        </div>
        <div>
          <div class="font-bold text-primary">{{ lootCount }}</div>
          <div class="text-xs text-base-content/60">Loot</div>
        </div>
        <div>
          <div class="font-bold text-secondary">{{ attendanceCount }}</div>
          <div class="text-xs text-base-content/60">Sessions</div>
        </div>
      </div>

      <div class="card-actions justify-end mt-2">
        <div v-if="character.characterSource === 'dndbeyond'" class="badge badge-sm badge-info">
          <Icon name="heroicons:link" class="h-3 w-3 mr-1" />
          D&D Beyond
        </div>
        <div v-if="character.characterSource === 'pdf'" class="badge badge-sm badge-warning">
          <Icon name="heroicons:document" class="h-3 w-3 mr-1" />
          PDF
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CharacterWithTotalLevel } from '~/types'

const props = defineProps<{
  character: CharacterWithTotalLevel
}>()

const router = useRouter()
const { getVoucherCount } = useLootVouchers()
const { getCharacterAttendanceCount } = useAttendance()

const lootCount = computed(() => getVoucherCount(props.character.id).unused)
const attendanceCount = computed(() => getCharacterAttendanceCount(props.character.id))

const goToCharacter = () => {
  router.push(`/characters/${props.character.id}`)
}
</script>
