export class User {
  constructor (displayName, courses, games, gamesStarted) {
    this.displayName = displayName
    this.courses = courses
    this.games = {}
    this.gamesStarted = []

    if (games) this.setGames(games)

    if (gamesStarted && gamesStarted.length > 0) {
      gamesStarted.forEach(e => {
        this.gamesStarted.push({ course: e.kurs, game: e.spiel })
      })
    }
  }

  setGames (gamesObj) {
    for (const [key, value] of Object.entries(gamesObj)) {
      const obj = {
        won: value.gewonnen || 0,
        lost: value.verloren || 0,
        tie: value.unentschieden || 0,
        questionsCorrect: value.fragenRichtig || 0,
        questionsIncorrect: value.fragenFalsch || 0
      }
      this.games[key] = obj
    }
  }
}

// Firestore data converter
export const UserConverter = {
  toFirestore: (user) => {
    const spiele = {}
    for (const [key, value] of Object.entries(user.games)) {
      const obj = {
        gewonnen: value.won || 0,
        verloren: value.lost || 0,
        unentschieden: value.tie || 0,
        fragenRichtig: value.questionsCorrect || 0,
        fragenFalsch: value.questionsIncorrect || 0
      }
      spiele[key] = obj
    }

    const spieleBegonnen = []
    user.gamesStarted.forEach(e => {
      spieleBegonnen.push({ kurs: e.course, spiel: e.game })
    })

    return {
      anzeigename: user.displayName,
      kurse: user.courses,
      spiele,
      spieleBegonnen
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new User(data.anzeigename, data.kurse, data.spiele, data.spieleBegonnen)
  }
}