const ADULT_AGE = 18

// birthDate em ISO yyyy-mm-dd; datas tratadas sem fuso para não deslocar o dia
export function ageOf(birthDate: string, today: Date = new Date()) {
  const [year = 0, month = 0, day = 0] = birthDate.slice(0, 10).split('-').map(Number)
  const hadBirthday =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)
  return today.getFullYear() - year - (hadBirthday ? 0 : 1)
}

export const isMinor = (birthDate: string, today: Date = new Date()) =>
  ageOf(birthDate, today) < ADULT_AGE
