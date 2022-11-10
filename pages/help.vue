<template>
  <v-container>
  <v-data-iterator
    :items="items"
    :search="search"
    no-data-text="Keine Daten vorhanden"
    no-results-text="Keine passenden Ergebnisse gefunden"
    locale="de-DE"
    hide-default-footer
    disable-pagination
    class="text-center"
  >
    <template #header>
      <v-container>
        <v-toolbar
          flat
          color="transparent"
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Suchen"
          ></v-text-field>
        </v-toolbar>
      </v-container>
    </template>

    <template #default="props">
      <v-container>
        <v-row>
          <v-col v-for="category in categories(props.items)" :key="category" cols="12">
            <v-card>
              <v-card-title>{{ capitalize(category) }}</v-card-title>
              <v-expansion-panels hover accordion>
                <v-expansion-panel
                  v-for="(item, i) in itemsPerCategory(props.items, category)"
                  :key="i"
                >
                  <v-expansion-panel-header>
                    <strong>{{ item.q }}</strong>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div class="text-left text-pre-wrap">{{ item.a }}</div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template #footer>
      <v-container>
        <v-card>
          <v-card-title class="justify-center text-subtitle-1">Keine Antwort gefunden? Schreib uns!</v-card-title>
          <v-card-subtitle class="text-subtitle-1 text-center">
            <a href="mailto:support@iu-quiz-app.de">support@iu-quiz-app.de</a>
          </v-card-subtitle>
        </v-card>
      </v-container>
    </template>
  </v-data-iterator>
  </v-container>
</template>

<script>
import _startCase from 'lodash-es/startCase'

export default {
  name: 'HelpPage',
  data () {
    return {
      search: '',
      filter: {},
      keys: [
        'Konto', 'Allgemein', 'Spiel', 'Punkte'
      ],
      items: [
        // Konto
        {
          q: 'Wie erhalte ich meine Zugangsdaten?',
          a: 'Du kannst dich einfach mit deiner IU-E-Mail-Adresse und einem Passwort deiner Wahl registrieren.',
          cat: 'konto'
        },
        {
          q: 'Wie wird mein Benutzerkonto freigeschaltet?',
          a: 'Nach der Registrierung senden wir Dir automatisch eine Bestätigungsmail an deine E-Mail-Adresse. Durch einen Klick auf den Link in der E-Mail verifizierst du deinen Account.',
          cat: 'konto'
        },
        {
          q: 'Wie kann ich meine Benutzerdaten ändern?',
          a: 'Du kannst deinen Anzeigenamen und dein Profilbild ändern, indem du in der Navigationsleiste auf deinen Namen klickst. Es ist aktuell nicht möglich deine E-Mail-Adresse zu ändern.',
          cat: 'konto'
        },
        {
          q: 'Was kann ich machen, wenn ich mein Passwort vergessen habe oder ändern möchte?',
          a: 'Klicke auf der Login-Seite auf den Link „Passwort vergessen?“. Wir schicken Dir anschließend einen Link zum Zurücksetzen deines Passworts an deine E-Mail-Adresse.',
          cat: 'konto'
        },
        {
          q: 'Wie lösche ich mein Benutzerkonto?',
          a: 'Dein Benutzerkonto wir nach längerer Inaktivität (6 Monate) automatisch gelöscht. Über die bevorstehende Löschung wirst du rechtzeitig per E-Mail informiert.',
          cat: 'konto'
        },
        // Allgemein
        {
          q: 'Wie kann ich einen Kurs zu meinen Favoriten hinzufügen?',
          a: 'Indem du in der Kursübersicht (Reiter "Alle Kurse") auf das Herzsymbol bei dem jeweiligen Kurs klickst. Der Kurs wird dir dann unter "Meine Kurse" angezeigt.',
          cat: 'allgemein'
        },
        {
          q: 'Was kann ich machen, wenn ich ein Problem mit der App habe, oder einen Fehler (Bug) finde?',
          a: 'Schreib uns! Du findest unsere E-Mail-Adresse am Ende dieser Seite.',
          cat: 'allgemein'
        },
        // Challenge Modus
        {
          q: 'Was ist der "Challenge Modus"?',
          a: 'Im Challenge Modus kannst du gegen deine Kommilitonen in zeitlich begrenzten Quizduellen antreten.',
          cat: 'challenge modus'
        },
        {
          q: 'Wie viel Zeit habe ich, um die Fragen zu beantworten?',
          a: 'Das Zeitlimit je Frage beträgt 20 Sekunden.',
          cat: 'challenge modus'
        },
        {
          q: 'Was passiert, wenn ich es nicht schaffe, die Fragen rechtzeitig zu beantworten?',
          a: 'In dem Fall wird die Frage als "falsch" markiert.',
          cat: 'challenge modus'
        },
        {
          q: 'Was passiert, wenn ich das Quiz verlasse, während der Timer läuft?',
          a: 'Auch in diesem Fall wird die Frage als "falsch" markiert.',
          cat: 'challenge modus'
        },
        {
          q: 'Wie weiß ich, dass ich gut für die Klausur vorbereitet bin?',
          a: 'In deiner persönlichen Statistik w, angezeigt wie gut du auf die Klausur vorbereitet bist. Bitte beachte, dass dies lediglich eine Empfehlung und keine Garantie für das Bestehen der Klausur ist!',
          cat: 'challenge modus'
        },
        {
          q: 'Wie kann ich neue Quizfragen hinzufügen?',
          a: 'Unterhalb des Spielebuttons hast du die Gelegenheit eigene Quizfragen einzureichen, die anschließend vom Tutor überprüft und freigegeben werden.',
          cat: 'challenge modus'
        },
        {
          q: 'Wie kann ich überprüfen, ob meine eingesendete Frage angenommen wurde? ',
          a: 'Unterhalb des Spielebuttons hast du die Gelegenheit eigene Quizfragen einzureichen, die anschließend vom Tutor überprüft und freigegeben werden.',
          cat: 'challenge modus'
        },
        // Koop Modus
        {
          q: 'Was ist der "Koop Modus"?',
          a: 'Im Challenge Modus kannst du gegen deine Kommilitonen in zeitlich begrenzten Quizduellen antreten.',
          cat: 'koop modus'
        },
        {
          q: 'Wie kann ich überprüfen, ob mein eingesendete Frage im Fragenkatalog vorhanden ist?',
          a: 'Indem du bei den Community Fragen, deine Fragen nach "Neueste" sortierst.',
          cat: 'koop modus'
        },
        {
          q: 'Wer kann mir helfen, wenn ich eine Aufgabenstellung nicht verstehe?',
          a: 'Wähle in der Navigationsleiste den Reiter "Community" aus. Du wirst anschließend zum Forum weitergeleitet, wo du dich mit deinen Kommilitonen über inhaltliche austauschen kannst.',
          cat: 'koop modus'
        },
      ]
    }
  },
  methods: {
    capitalize (string) {
      return _startCase(string)
    },
    categories (items) {
      return [...new Set(items.map(i => i.cat))]
    },
    itemsPerCategory (items, key) {
      return items.filter(i => i.cat === key.toLowerCase())
    }
  }
}
</script>