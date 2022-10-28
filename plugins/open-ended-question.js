export class OpenEndedQuestion {
  constructor (id, question, solution, creator, created, ratings, difficulty) {
    this.id = id
    this.question = question
    this.solution = solution
    this.creator = creator
    this.created = created
    this.ratings = ratings
    this.difficulty = difficulty
  }
}

// Firestore data converter
export const OpenEndedQuestionConverter = {
  toFirestore: (openEndedQuestion) => {
    return {
      frage: openEndedQuestion.question,
      musterloesung: openEndedQuestion.solution,
      ersteller: openEndedQuestion.creator,
      erstellt: openEndedQuestion.created,
      bewertungen: openEndedQuestion.ratings,
      schwierigkeit: openEndedQuestion.difficulty
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new OpenEndedQuestion(snapshot.id, data.frage, data.musterloesung, data.ersteller, data.erstellt, data.bewertungen, data.schwierigkeit)
  }
}