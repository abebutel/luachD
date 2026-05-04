export const getUpcomingEvents = (members, azkarot) => {
  const today = new Date();
  const fourteenDaysFromNow = new Date();
  fourteenDaysFromNow.setDate(today.getDate() + 14);

  return members.filter(member => {
    if (!member.is_approved) return false;
    
    const bday = new Date(member.birthday);
    // Logic to check if bday falls within next 14 days regardless of year
    bday.setFullYear(today.getFullYear());
    
    return bday >= today && bday <= fourteenDaysFromNow;
  });
};