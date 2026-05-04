import { HDate } from '@hebcal/core'

export function getUpcomingHebrewEvents(members, azkarot = []) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const in14Days = new Date(today)
  in14Days.setDate(today.getDate() + 14)

  const currentHYear = new HDate(today).getFullYear()
  let upcoming = []

  // Helper function: Processes any date and drops it into our timeline
  const processEvent = (gregorianDateStr, name, typeLabel, icon) => {
    if (!gregorianDateStr) return

    const origHDate = new HDate(new Date(gregorianDateStr))
    
    try {
      let targetHDate = new HDate(origHDate.getDate(), origHDate.getMonth(), currentHYear)
      let targetGreg = targetHDate.greg()
      targetGreg.setHours(0, 0, 0, 0)

      if (targetGreg < today) {
          targetHDate = new HDate(origHDate.getDate(), origHDate.getMonth(), currentHYear + 1)
          targetGreg = targetHDate.greg()
          targetGreg.setHours(0, 0, 0, 0)
      }

      if (targetGreg >= today && targetGreg <= in14Days) {
          const daysAway = Math.floor((targetGreg - today) / (1000 * 60 * 60 * 24))
          let timeText = daysAway === 0 ? 'היום!' : daysAway === 1 ? 'מחר' : `בעוד ${daysAway} ימים`

          upcoming.push({
            name: name,
            type: typeLabel,
            icon: icon,
            hebrewDateStr: targetHDate.renderGematriya(true),
            daysAway: daysAway,
            timeText: timeText
          })
      }
    } catch(e) {
      console.warn(`Skipping invalid Hebrew date for ${name}`)
    }
  }

  // 1. Process Birthdays
  members.forEach(member => {
    processEvent(member.birthday, member.full_name, 'מזל טוב! יום הולדת', '🎉')
  })

  // 2. Process Azkarot
  azkarot.forEach(azkara => {
    processEvent(azkara.date_gregorian, azkara.deceased_name, 'אזכרה לעילוי נשמת', '🕯️')
  })

  // Sort by closest date
  return upcoming.sort((a, b) => a.daysAway - b.daysAway)
}