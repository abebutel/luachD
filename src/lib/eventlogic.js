import { HDate } from '@hebcal/core'

export function getUpcomingHebrewEvents(members) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const in14Days = new Date(today)
  in14Days.setDate(today.getDate() + 14)

  const currentHYear = new HDate(today).getFullYear()
  let upcoming = []

  members.forEach(member => {
    if (member.birthday) {
      // 1. Get the original Hebrew birth date
      const origHDate = new HDate(new Date(member.birthday))
      
      try {
        // 2. Find when that exact Hebrew date occurs THIS year
        let targetHDate = new HDate(origHDate.getDate(), origHDate.getMonth(), currentHYear)
        let targetGreg = targetHDate.greg()
        targetGreg.setHours(0, 0, 0, 0)

        // 3. If it already passed this year, check if it's coming up at the very start of NEXT Hebrew year
        if (targetGreg < today) {
            targetHDate = new HDate(origHDate.getDate(), origHDate.getMonth(), currentHYear + 1)
            targetGreg = targetHDate.greg()
            targetGreg.setHours(0, 0, 0, 0)
        }

        // 4. Check if the event falls in our 14-day window
        if (targetGreg >= today && targetGreg <= in14Days) {
            const daysAway = Math.floor((targetGreg - today) / (1000 * 60 * 60 * 24))
            let timeText = daysAway === 0 ? 'היום!' : daysAway === 1 ? 'מחר' : `בעוד ${daysAway} ימים`

            upcoming.push({
            name: member.full_name,
            type: 'מזל טוב! יום הולדת',
            hebrewDateStr: targetHDate.renderGematriya(true), // e.g., כ״ה באייר
            daysAway: daysAway,
            timeText: timeText
            })
        }
      } catch(e) {
        // Safely skip impossible calendar dates (like Adar 30 in a non-leap year)
        console.warn(`Skipping invalid Hebrew date for ${member.full_name}`)
      }
    }
  })

  // Sort them so the most immediate events are at the top
  return upcoming.sort((a, b) => a.daysAway - b.daysAway)
}