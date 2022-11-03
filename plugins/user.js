export class User {
  constructor (displayName, gamesStarted) {
    this.displayName = displayName
    this.gamesStarted = []

    if (gamesStarted && gamesStarted.length > 0) {
      gamesStarted.forEach(e => {
        this.gamesStarted.push({ course: e.kurs, game: e.spiel })
      })
    }
  }
}

// Firestore data converter
export const UserConverter = {
  toFirestore: (user) => {
    const spieleBegonnen = []
    user.gamesStarted.forEach(e => {
      spieleBegonnen.push({ kurs: e.course, spiel: e.game })
    })

    return {
      anzeigename: user.displayName,
      spieleBegonnen
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new User(data.anzeigename, data.spieleBegonnen)
  }
}