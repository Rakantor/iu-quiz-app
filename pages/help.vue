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
        <v-container fluid class="px-0">
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
        <v-container fluid class="px-0">
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
                      <div class="text-left">{{ item.a }}</div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <template #footer>
        <v-container fluid class="px-0">
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
          a: `Nach der Registrierung senden wir Dir automatisch eine Best??tigungsmail an deine E-Mail-Adresse.
            Durch einen Klick auf den Link in der E-Mail verifizierst du deinen Account.`,
          cat: 'konto'
        },
        {
          q: 'Wie kann ich meine Benutzerdaten ??ndern?',
          a: `Du kannst deinen Anzeigenamen und dein Profilbild ??ndern, indem du in der Navigationsleiste auf deinen Namen klickst.
            Es ist aktuell nicht m??glich deine E-Mail-Adresse zu ??ndern.`,
          cat: 'konto'
        },
        {
          q: 'Was kann ich machen, wenn ich mein Passwort vergessen habe oder ??ndern m??chte?',
          a: `Klicke auf der Login-Seite auf den Link "Passwort vergessen?".
            Wir schicken Dir anschlie??end einen Link zum Zur??cksetzen deines Passworts an deine E-Mail-Adresse.`,
          cat: 'konto'
        },
        {
          q: 'Wie l??sche ich mein Benutzerkonto?',
          a: `Dein Benutzerkonto wir nach l??ngerer Inaktivit??t (6 Monate) automatisch gel??scht.
            ??ber die bevorstehende L??schung wirst du rechtzeitig per E-Mail informiert.`,
          cat: 'konto'
        },
        // Allgemein
        {
          q: 'Wie kann ich einen Kurs zu meinen Favoriten hinzuf??gen?',
          a: `Indem du in der Kurs??bersicht (Reiter "Alle Kurse") auf das Herzsymbol
            bei dem jeweiligen Kurs klickst. Der Kurs wird dir dann unter "Meine Kurse" angezeigt.`,
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
          q: 'Wie komme ich zur n??chsten Frage?',
          a: 'Klicke/tippe auf das Fragenfeld oder eines der Antwortfelder!',
          cat: 'challenge modus'
        },
        {
          q: 'Wie viel Zeit habe ich, um die Fragen zu beantworten?',
          a: 'Das Zeitlimit je Frage betr??gt 20 Sekunden.',
          cat: 'challenge modus'
        },
        {
          q: 'Was passiert, wenn ich es nicht schaffe, die Fragen rechtzeitig zu beantworten?',
          a: 'In dem Fall wird die Frage als "falsch" markiert.',
          cat: 'challenge modus'
        },
        {
          q: 'Was passiert, wenn ich das Quiz verlasse, w??hrend der Timer l??uft?',
          a: 'Auch in diesem Fall wird die Frage als "falsch" markiert.',
          cat: 'challenge modus'
        },
        {
          q: 'Wie wei?? ich, dass ich gut f??r die Klausur vorbereitet bin?',
          a: `In deiner pers??nlichen Statistik (unterhalb des Spielebuttons) wird dir angezeigt,
            wie gut du auf die Klausur vorbereitet bist. Bitte beachte, dass dies lediglich eine Empfehlung
            und keine Garantie f??r das Bestehen der Klausur ist!`,
          cat: 'challenge modus'
        },
        {
          q: 'Wie kann ich neue Quizfragen hinzuf??gen?',
          a: `Unterhalb des Buttons "Spielen" findest du den Reiter "Neue Quizfrage einreichen".
            Hier hast du die Gelegenheit eigene Quizfragen einzureichen,
            die anschlie??end vom Tutor ??berpr??ft und freigegeben werden.`,
          cat: 'challenge modus'
        },
        {
          q: 'Wie kann ich ??berpr??fen, ob meine eingesendete Frage angenommen wurde?',
          a: `Wechsle innerhalb des Reiters "Neue Quizfrage einreichen" zu dem Tab "Meine Fragen".
            Hier findest du die Auflistung deiner eingereichten Fragen und kannst den jeweiligen Status einsehen.`,
          cat: 'challenge modus'
        },
        // Koop Modus
        {
          q: 'Was ist der "Koop Modus" alias "Community Fragen"?',
          a: `Hierbei handelt es sich um einen Fragenkatalog von offenen Fragen,
            der kollaborativ von allen Kursteilnehmern gepflegt werden kann.
            Das hei??t, jeder kann neue Fragen hinzuf??gen und bestehende Fragen ??berarbeiten!
            Au??erdem kann jeder Kursteilnehmer die Fragen hinsichtlich deren inhaltlichen Qualit??t
            und Schwierigkeit bewerten.`,
          cat: 'koop modus'
        },
        {
          q: 'Wie kann ich die Fragen meiner Kommilitonen bewerten?',
          a: `Unterhalb der Musterl??sung der jeweiligen Frage findest du f??nf Icons.
            Hier kannst du die Frage als "Hilfreich" markieren,
            die Schwierigkeit bewerten (leicht, mittelschwer, schwer)
            oder die Frage bearbeiten/korrigieren.`,
          cat: 'koop modus'
        },
        {
          q: 'Wie kann ich neue Fragen hinzuf??gen?',
          a: `Unterhalb des Fragenkatalogs findest du den Reiter "Eigene Frage einsenden".
            Im Gegensatz zu Quizfragen werden Community Fragen nicht vom Tutor gepr??ft und
            werden nach der Erstellung direkt im Fragenkatalog aufgelistet.`,
          cat: 'koop modus'
        },
        {
          q: 'Wie kann ich ??berpr??fen, ob meine eingesendete Frage im Fragenkatalog vorhanden ist?',
          a: 'Indem du den Fragenkatalog nach "Neueste" sortierst, oder einen Teil deiner Frage ins Suchfeld eintippst.',
          cat: 'koop modus'
        },
        {
          q: 'Wer kann mir helfen, wenn ich eine Aufgabenstellung nicht verstehe?',
          a: `W??hle in der Navigationsleiste den Reiter "Community" aus.
            Du wirst anschlie??end zum Forum weitergeleitet, wo du dich mit deinen Kommilitonen ??ber inhaltliche austauschen kannst.`,
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