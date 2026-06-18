// Ignore les rejets réseau résiduels (fetch annulé au teardown)
Cypress.on("uncaught:exception", (err) =>
  !err.message.includes("Failed to fetch")
);

describe("Parcours utilisateur complet", () => {
  const unique = Date.now();
  const email = `e2e_${unique}@ynov.com`;

  it("inscription, liste, login admin, détails et suppression", () => {
    cy.visit("/");

    // --- 1. Inscription via le formulaire ---
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Mot de passe"]').type("e2epassword");
    cy.get('input[placeholder="Prénom"]').type("E2E");
    cy.get('input[placeholder="Nom"]').type("Tester");
    cy.get('input[placeholder="Ville"]').type("Lyon");
    cy.contains("button", "S'inscrire").click();

    // message de confirmation + apparition dans la liste
    cy.contains("Inscription enregistrée").should("be.visible");
    cy.get(".user-list").contains("E2E Tester").should("be.visible");

    // --- 2. Connexion admin ---
    cy.get('input[placeholder="Email admin"]').type("loise.fenoll@ynov.com");
    cy.get('input[placeholder="Mot de passe admin"]').type("PvdrTAzTeR247sDnAZBr");
    cy.contains("button", "Connexion admin").click();
    cy.contains("Connecté en tant que").should("be.visible");

    // --- 3. Voir les infos privées de l'inscrit créé ---
    cy.get(".user-list li")
      .contains("E2E Tester")
      .parents("li")
      .within(() => {
        cy.contains("button", "Détails").click();
      });
    cy.get(".details").should("contain", email);

    // --- 4. Supprimer l'inscrit ---
    cy.get(".user-list li")
      .contains("E2E Tester")
      .parents("li")
      .within(() => {
        cy.contains("button", "Supprimer").click();
      });
    cy.get(".user-list").should("not.contain", "E2E Tester");
  });
});
