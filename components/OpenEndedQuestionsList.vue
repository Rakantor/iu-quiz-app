<template>
  <v-data-iterator
    :items="items"
    :items-per-page.sync="itemsPerPage"
    :page.sync="page"
    :search="search"
    disable-sort
    no-data-text="Keine Daten vorhanden"
    no-results-text="Keine passenden Ergebnisse gefunden"
    locale="de-DE"
    class="text-center"
    :footer-props="{ itemsPerPageOptions: itemsPerPageArray, itemsPerPageText: 'Fragen pro Seite'}"
  >
    <template #header>
      <v-toolbar flat class="mb-1">
        <v-text-field
          v-model="search"
          clearable
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="Suchen"
        ></v-text-field>
        <template v-if="$vuetify.breakpoint.mdAndUp">
          <v-spacer></v-spacer>
          <v-select
            v-model="sortBy"
            flat
            solo-inverted
            hide-details
            :items="keys"
            item-text="key"
            item-value="value"
            prepend-inner-icon="mdi-sort"
            label="Sortieren"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn-toggle
            v-model="sortDesc"
            mandatory
          >
            <v-btn large depressed :value="false">
              <v-icon>mdi-sort-ascending</v-icon>
            </v-btn>
            <v-btn large depressed :value="true">
              <v-icon>mdi-sort-descending</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
      </v-toolbar>
    </template>

    <template #default="props">
      <v-container fluid>
        <v-card outlined>
          <v-expansion-panels v-model="openPanels" hover accordion>
            <v-expansion-panel
              v-for="(item, i) in props.items"
              :key="i"
              @click="setSelectedQuestion(item)"
            >
              <v-expansion-panel-header v-slot="{ open }">
                <v-row dense>
                  <v-col cols="12" class="text-overline text--secondary">
                    <strong>Kapitel {{ item.chapter || '-' }}</strong>
                  </v-col>
                  <v-col cols="12" class="text-pre-wrap">
                    <strong>{{ item.question }}</strong>
                  </v-col>
                  <v-fade-transition leave-absolute>
                    <v-col v-if="!open" cols="12" class="text-caption text--secondary">
                      <v-row style="width: 100%">
                        <v-col cols="auto">
                          Hilfreich: {{ item.helpful.length }}
                        </v-col>
                        <v-col cols="auto">
                          Schwierigkeit: {{ item.getDifficultyString() }}
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-fade-transition>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row no-gutters>
                  <v-col cols="12" class="mb-4">
                    <div class="text-left text-pre-wrap">{{ item.solution }}</div>
                  </v-col>
                  <v-col v-for="(btn, btni) in actionButtons" :key="btni" cols="auto" :class="btn.class">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn icon :color="btn.active ? btn.iconColor : ''" v-bind="attrs" v-on="on" @click="btn.onClick">
                          <v-icon>{{ btn.active ? btn.iconActive : btn.iconInactive }}</v-icon>
                        </v-btn>
                      </template>
                      <span>{{ btn.tooltip }}</span>
                    </v-tooltip>
                    <div class="text-caption text--secondary">{{ btn.caption }}</div>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-container>
    </template>

    <!-- eslint-disable-next-line -->
    <template #footer.page-text="{ pageStart, pageStop, itemsLength }">
      <span>{{ pageStart }} - {{ pageStop }} von {{ itemsLength }}</span>
    </template>
  </v-data-iterator>
</template>

<script>
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

export default {
  name: 'OpenEndedQuestionsList',
  props: {
    questions: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      items: [],
      itemsPerPageArray: [10, 25, 50],
      search: '',
      sortDesc: true,
      page: 1,
      itemsPerPage: 10,
      sortBy: 'created',
      keys: [
        { key: 'Neueste', value: 'created' },
        { key: 'Kapitel', value: 'chapter' },
        { key: 'Hilfreich', value: 'helpful' },
        { key: 'Schwierigkeit', value: 'difficultyLevel' }
      ],
      openPanels: [],
      selectedQuestion: null
    }
  },
  computed: {
    courseId () {
      return this.$store.state.selectedCourse
    },
    numberOfPages () {
      return Math.ceil(this.questions.length / this.itemsPerPage)
    },
    actionButtons () {
      const self = this
      return [
        // Button "Helpful"
        {
          active: this.helpful,
          iconActive: 'mdi-thumb-up',
          iconInactive: 'mdi-thumb-up-outline',
          iconColor: 'primary',
          caption: this.selectedQuestion && this.selectedQuestion.helpful.length,
          tooltip: 'Hilfreich',
          class: 'mr-4',
          onClick() { self.toggleHelpful() }
        },
        // Button "Easy Question"
        {
          active: this.difficulty === 'easy',
          iconActive: 'mdi-emoticon',
          iconInactive: 'mdi-emoticon-outline',
          iconColor: 'amber',
          caption: this.selectedQuestion && this.selectedQuestion.difficulty.easy.length,
          tooltip: 'Leichte Frage',
          onClick() { self.toggleDifficulty('easy') }
        },
        // Button "Moderate Question"
        {
          active: this.difficulty === 'medium',
          iconActive: 'mdi-emoticon-happy',
          iconInactive: 'mdi-emoticon-happy-outline',
          iconColor: 'amber',
          caption: this.selectedQuestion && this.selectedQuestion.difficulty.medium.length,
          tooltip: 'Mittelschwere Frage',
          onClick() { self.toggleDifficulty('medium') }
        },
        // Button "Hard Question"
        {
          active: this.difficulty === 'hard',
          iconActive: 'mdi-emoticon-confused',
          iconInactive: 'mdi-emoticon-confused-outline',
          iconColor: 'amber',
          caption: this.selectedQuestion && this.selectedQuestion.difficulty.hard.length,
          tooltip: 'Schwere Frage',
          onClick() { self.toggleDifficulty('hard') }
        }
      ]
    },
    helpful () {
      return this.selectedQuestion && this.selectedQuestion.helpful.includes(this.$auth.currentUser.uid)
    },
    difficulty () {
      if (this.selectedQuestion && this.selectedQuestion.difficulty.easy.includes(this.$auth.currentUser.uid)) return 'easy'
      else if (this.selectedQuestion && this.selectedQuestion.difficulty.medium.includes(this.$auth.currentUser.uid)) return 'medium'
      else if (this.selectedQuestion && this.selectedQuestion.difficulty.hard.includes(this.$auth.currentUser.uid)) return 'hard'
      else return null
    }
  },
  watch: {
    questions () {
      this.items = [...this.questions]
      this.sort()
    },
    sortBy () {
      this.sort()
    },
    sortDesc () {
      this.sort()
    }
  },
  methods: {
    sort () {
      if (this.items && this.items.length > 0) {
        this.items.sort((a, b) => {
          if (this.sortBy === 'helpful') {
            return this.sortDesc
              ? b[this.sortBy].length - a[this.sortBy].length
              : a[this.sortBy].length - b[this.sortBy].length
          } else {
            return this.sortDesc
              ? b[this.sortBy] - a[this.sortBy]
              : a[this.sortBy] - b[this.sortBy]
          }
        })
      }
    },
    setSelectedQuestion(q) {
      this.selectedQuestion = q
    },
    toggleHelpful () {
      const qRef = doc(this.$db, `kurse/${this.courseId}/fragenOffen/${this.selectedQuestion.id}`)

      updateDoc(qRef, {
        hilfreich: this.helpful ? arrayRemove(this.$auth.currentUser.uid) : arrayUnion(this.$auth.currentUser.uid)
      }).then((empty) => {
        // Update question in list
        if (this.helpful) {
          const index = this.selectedQuestion.helpful.indexOf(this.$auth.currentUser.uid)
          this.selectedQuestion.helpful.splice(index, 1)
        } else {
          this.selectedQuestion.helpful.push(this.$auth.currentUser.uid)
        }
      }).catch((error) => {
        // Failed to update the question; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    toggleDifficulty (type) {
      const typesDE = { easy: 'leicht', medium: 'mittel', hard: 'schwer' }
      const typeDE = typesDE[type]
      const updateProps = {}

      if (this.difficulty === type) {
        updateProps[`schwierigkeit.${typeDE}`] = arrayRemove(this.$auth.currentUser.uid)
      } else {
        if (typeDE !== typesDE.easy) updateProps['schwierigkeit.leicht'] = arrayRemove(this.$auth.currentUser.uid)
        if (typeDE !== typesDE.medium) updateProps['schwierigkeit.mittel'] = arrayRemove(this.$auth.currentUser.uid)
        if (typeDE !== typesDE.hard) updateProps['schwierigkeit.schwer'] = arrayRemove(this.$auth.currentUser.uid)
        updateProps[`schwierigkeit.${typeDE}`] = arrayUnion(this.$auth.currentUser.uid)
      }

      updateDoc(doc(this.$db, `kurse/${this.courseId}/fragenOffen/${this.selectedQuestion.id}`), updateProps)
      .then((empty) => {
        // Update question in list
        if (this.difficulty === type) {
          const index = this.selectedQuestion.difficulty[type].indexOf(this.$auth.currentUser.uid)
          this.selectedQuestion.difficulty[type].splice(index, 1)
        } else {
          const indexEasy = this.selectedQuestion.difficulty.easy.indexOf(this.$auth.currentUser.uid)
          if (indexEasy !== -1) this.selectedQuestion.difficulty.easy.splice(indexEasy, 1)
          const indexMedium = this.selectedQuestion.difficulty.medium.indexOf(this.$auth.currentUser.uid)
          if (indexMedium !== -1) this.selectedQuestion.difficulty.medium.splice(indexMedium, 1)
          const indexHard = this.selectedQuestion.difficulty.hard.indexOf(this.$auth.currentUser.uid)
          if (indexHard !== -1) this.selectedQuestion.difficulty.hard.splice(indexHard, 1)
          this.selectedQuestion.difficulty[type].push(this.$auth.currentUser.uid)
        }
        this.selectedQuestion.updateDifficultyLevel()
      }).catch((error) => {
        // Failed to update the question; display error message
        this.$toast({ content: error, color: 'error' })
      })
    }
  },
}
</script>