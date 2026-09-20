import { createTheme, type Shadows } from '@mui/material/styles'
import { ptBR as corePtBR } from '@mui/material/locale'
import { ptBR as gridPtBR } from '@mui/x-data-grid/locales'
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales'
import type {} from '@mui/x-data-grid/themeAugmentation'

const colors = {
  primary: { main: '#4F7F73', light: '#7FA89B', dark: '#3A5F55' },
  alert: '#C2452D',
  background: { default: '#F6F5F2', paper: '#FFFFFF' },
  divider: '#DDD9D2',
  text: { primary: '#26302E', secondary: '#5F6B68' },
}

const headingFont = '"Fraunces", Georgia, serif'
const bodyFont = '"Source Sans 3", "Segoe UI", system-ui, sans-serif'
const heading = { fontFamily: headingFont, fontWeight: 600, letterSpacing: '-0.01em' }

export const theme = createTheme(
  {
    palette: {
      primary: { ...colors.primary, contrastText: colors.background.paper },
      secondary: { main: colors.text.secondary },
      error: { main: colors.alert },
      warning: { main: colors.alert },
      success: { main: colors.primary.main },
      info: { main: colors.primary.main },
      background: colors.background,
      divider: colors.divider,
      text: colors.text,
    },
    shape: { borderRadius: 4 },
    shadows: Array<string>(25).fill('none') as Shadows,
    typography: {
      fontFamily: bodyFont,
      fontSize: 14,
      htmlFontSize: 16,
      h1: { ...heading, fontSize: '1.75rem', lineHeight: 1.2 },
      h2: { ...heading, fontSize: '1.5rem', lineHeight: 1.25 },
      h3: { ...heading, fontSize: '1.25rem', lineHeight: 1.3 },
      h4: { ...heading, fontSize: '1.125rem', lineHeight: 1.3 },
      h5: { ...heading, fontSize: '1rem', lineHeight: 1.35 },
      h6: { ...heading, fontSize: '0.9375rem', lineHeight: 1.35 },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          '.print-sheet': { display: 'none' },
          '@page': { size: 'A4', margin: '18mm' },
          '@media print': {
            // esconde o app e qualquer portal aberto (Dialog, Menu); só o .print-sheet sai no papel
            'body > :not(.print-sheet)': { display: 'none !important' },
            'html, body': {
              background: theme.palette.common.white,
              color: theme.palette.common.black,
            },
            '.print-sheet': { display: 'block' },
            '.print-page-break': { breakBefore: 'page' },
          },
        }),
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
        },
      },
      MuiAppBar: {
        defaultProps: { color: 'inherit' },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderWidth: '0 0 1px',
          }),
        },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true },
        styleOverrides: {
          root: {
            '&:not(:last-of-type)': { borderBottomWidth: 0 },
            '&::before': { display: 'none' },
          },
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiDataGrid: {
        defaultProps: { density: 'compact' },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            '--DataGrid-t-header-background-base': theme.palette.background.default,
          }),
          columnHeaderTitle: { fontWeight: 600 },
        },
      },
      MuiChip: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            fontWeight: 600,
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: ({ theme }) => ({ borderBottom: `1px solid ${theme.palette.divider}` }),
        },
      },
      MuiTab: {
        styleOverrides: { root: { minHeight: 44, fontWeight: 600 } },
      },
    },
  },
  corePtBR,
  gridPtBR,
  pickersPtBR,
)
