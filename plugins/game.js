export class Game {
  constructor (id, questions, created, completed, player1id, player1name, player1answers, player2id, player2name, player2answers) {
    this.id = id
    this.questionIds = questions
    this.created = created
    this.completed = completed
    this.player1id = player1id
    this.player1name = player1name
    this.player1answers = player1answers
    this.player2id = player2id
    this.player2name = player2name
    this.player2answers = player2answers
    this.playerIds = []

    if (this.player1id) this.playerIds.push(this.player1id)
    if (this.player2id) this.playerIds.push(this.player2id)
  }

  getResult () {
    const correctAnswersPl1 = this.player1answers.filter(a => a.richtig).length
    const correctAnswersPl2 = this.player2answers.filter(a => a.richtig).length

    return {
      winner: correctAnswersPl1 > correctAnswersPl2 ? 1 : 2,
      loser: correctAnswersPl1 > correctAnswersPl2 ? 2 : 1,
      tie: correctAnswersPl1 === correctAnswersPl2,
      correctAnswersPl1,
      correctAnswersPl2
    }
  }
}

// Firestore data converter
export const GameConverter = {
  toFirestore: (game) => {
    return {
      fragen: game.questionIds,
      erstellt: game.created,
      abgeschlossen: game.completed,
      spieler1id: game.player1id,
      spieler1name: game.player1name,
      spieler1antworten: game.player1answers,
      spieler2id: game.player2id,
      spieler2name: game.player2name,
      spieler2antworten: game.player2answers,
      spielerIds: game.playerIds
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new Game(
      snapshot.id, data.fragen, data.erstellt, data.abgeschlossen,
      data.spieler1id, data.spieler1name, data.spieler1antworten,
      data.spieler2id, data.spieler2name, data.spieler2antworten
    )
  }
}