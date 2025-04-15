const fs = require("fs");
const path = require("path");
const axios = require("axios");
const xml2js = require("xml2js");

const retorikApiUrl = "";
const retorikAccessTokenUrl = "";
const retorikUsername = "";
const retorikPassword = "";
const xmlDir = "files";

function processXmlFiles() {
  fs.readdir(xmlDir, async (err, files) => {
    if (err) {
      console.error("Erreur lors de la lecture du répertoire :", err);
      return;
    }
    for (const file of files) {
      const filePath = path.join(xmlDir, file);
      try {
        const xmlContent = await readFile(filePath);
        const document = await processXmlContent(xmlContent);

        if (document) {
          await sendFileToRetorik(document);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement du fichier ${file} :`, error);
      }
    }
  });
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function processXmlContent(xmlContent) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
      } else {
        try {
          console.log("Structure du fichier XML vérifié");

          const jsonRow = result.Document;

          // Remplacez les chemins d'accès ci-dessous par les chemins corrects après vérification de la structure
          const document = {
            // Utilisation de l'ID comme ContentItemId
            ContentItemId: "",
            // Générez ou ignorez ce champ si non pertinent
            ContentItemVersionId: "generated-id-here",
            // Type de contenu spécifié
            ContentType: "ContentTypeName",
            // Utilisation du numéro comme DisplayText
            DisplayText: "",
            // Toujours true si c'est la dernière version
            Latest: true,
            // Toujours true si publié
            Published: true,
            // Date de modification
            ModifiedUtc: new Date().toISOString(),
            // Date de publication
            PublishedUtc: new Date().toISOString(),
            // Date de création
            CreatedUtc: new Date().toISOString(),
            // ID du propriétaire spécifié
            Owner: "owner-id-here",
            // Auteur spécifié
            Author: "admin",

            ContentTypeName: {
              // à remplir
            },
            TitlePart: {
              // à remplir
            },
            Thing: {
              // à remplir
            }
          };

          resolve(document);
        } catch (error) {
          console.error("Erreur lors du traitement du contenu XML :", error);
          reject(error);
        }
      }
    });
  });
}

async function sendFileToRetorik(document) {
  try {
    const accessToken = await getAccessToken();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    await axios.post(retorikApiUrl, document, { headers });
    console.log(
      `Fichier ${document.ContentItemId} envoyé avec succès à Retorik.`
    );
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du fichier à Retorik :",
      error.response ? error.response.data : error.message
    );
  }
}

// // // Fonction pour obtenir le jeton d'accès Retorik
async function getAccessToken() {
  const authHeader = `Basic ${Buffer.from(
    `${retorikUsername}:${retorikPassword}`
  ).toString("base64")}`;
  const tokenRequestBody = "grant_type=client_credentials";

  try {
    const response = await axios.post(retorikAccessTokenUrl, tokenRequestBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
    });
    return response.data.access_token;
  } catch (error) {
    throw new Error(
      `Erreur lors de l'obtention du jeton d'accès Retorik : ${error.response ? error.response.data.error_description : error.message
      }`
    );
  }
}

processXmlFiles();