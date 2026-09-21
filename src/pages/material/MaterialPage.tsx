import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Download from "@mui/icons-material/Download";
import OpenInNew from "@mui/icons-material/OpenInNew";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import AttachmentsField from "../../components/AttachmentsField.tsx";
import Toast from "../../components/Toast.tsx";
import { useAttachmentDraft } from "../../components/useAttachmentDraft.ts";
import { useSave } from "../../components/useSave.ts";
import {
  CLINIC_MATERIALS,
  type ClinicMaterial,
} from "../../mocks/materials.ts";
import { downloadBlob } from "../../utils/files.ts";
import { useTenantId } from "../../auth/useSession.ts";

// RF-16: tela própria (fora do perfil do paciente) com o material da clínica, fixo, e os documentos que o profissional anexa.
// Os anexos pertencem à clínica (o tenant), não a um paciente.
export default function MaterialPage() {
  const tenantId = useTenantId();
  const attachments = useAttachmentDraft({ type: "material", id: tenantId });
  const { saving, error, run } = useSave();
  const [downloadError, setDownloadError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function download(material: ClinicMaterial) {
    setDownloadError(false);
    try {
      const response = await fetch(material.url);
      if (!response.ok) throw new Error("arquivo indisponível");
      downloadBlob(await response.blob(), material.name);
    } catch {
      setDownloadError(true);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 840, mx: 'auto' }}>
      <Box>
        <Typography variant="h1">Material auxiliar</Typography>
        <Typography color="text.secondary">
          Materiais de apoio da clínica: o que já vem com o sistema e os
          documentos que você anexar.
        </Typography>
      </Box>

      <Box component="section" aria-labelledby="material-clinica">
        <Typography
          id="material-clinica"
          variant="h6"
          component="h3"
          sx={{ mb: 1 }}
        >
          Material da profissional
        </Typography>
        {downloadError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Não foi possível baixar o arquivo.
          </Alert>
        )}
        <Paper
          component="ul"
          role="list"
          sx={{ listStyle: "none", m: 0, p: 0 }}
        >
          {CLINIC_MATERIALS.map((material, index) => (
            <Stack
              component="li"
              key={material.id}
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              gap={1.5}
              sx={{
                p: 1.5,
                borderTop: index > 0 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                <PictureAsPdf color="action" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ overflowWrap: "anywhere" }}>
                    {material.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF · material da profissional
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" gap={1}>
                <Button
                  component="a"
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  aria-label={`Abrir ${material.name}`}
                >
                  Abrir
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download />}
                  aria-label={`Baixar ${material.name}`}
                  onClick={() => download(material)}
                >
                  Baixar
                </Button>
              </Stack>
            </Stack>
          ))}
        </Paper>
      </Box>

      <AttachmentsField
        title="Documentos anexados"
        attachments={attachments}
        saveNote="ao salvar o material"
      />

      {error && <Alert severity="error">{error}</Alert>}
      <Box>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() =>
            run(async () => {
              await attachments.apply();
              setToast("Material salvo.");
            })
          }
        >
          Salvar material
        </Button>
      </Box>
      <Toast message={toast} onClose={() => setToast(null)} />
    </Stack>
  );
}
