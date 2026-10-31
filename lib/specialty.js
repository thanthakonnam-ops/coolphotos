// Filter labels look like "พอร์ตเทรต/รับปริญญา" while photographers store
// "พอร์ตเทรต, รับปริญญา, แฟชั่น" — so match on any keyword in the label.
export function specialtyKeywords(filter) {
  return filter
    .split('/')
    .map((word) => word.trim())
    .filter(Boolean)
}

export function matchesSpecialty(specialty, filter) {
  if (!filter || filter === 'ทั้งหมด') return true
  const text = (specialty || '').toLowerCase()
  return specialtyKeywords(filter).some((word) => text.includes(word.toLowerCase()))
}
