const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// yyyy-mm-dd → dd/mm/aaaa
export const formatDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export const formatCurrency = (value: number) => brl.format(value)

// competência yyyy-mm → mm/aaaa
export const formatPeriod = (period: string) => period.slice(0, 7).split('-').reverse().join('/')
