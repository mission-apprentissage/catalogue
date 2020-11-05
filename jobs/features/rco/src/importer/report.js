class Report {
  constructor() {}

  generate(added, updated) {
    if (added.length > 0) {
      console.log(`Formation(s) ajoutée(s) ${added.length}`);
      console.table(added);
    }

    if (updated.length > 0) {
      console.log(`Formation(s) mise(s) à jour ${updated.length}`);
      console.table(updated);
      console.log(this.tableMarkupFromObjectArray(updated));
    }
  }

  tableMarkupFromObjectArray(obj) {
    let headers = `
          <th>Index</th>${Object.keys(obj[0])
            .map(
              col => `
          <th>${col}</th>`
            )
            .join("")}`;

    let content = obj
      .map(
        (row, idx) => `
        <tr>
          <td>${idx}</td>${Object.values(row)
          .map(
            datum => `
          <td>${datum}</td>`
          )
          .join("")}
        </tr>
  `
      )
      .join("");

    let tablemarkup = `
    <table>
      <thead>
        <tr>${headers}
        </tr>
      </thead>
      <tbody>${content}   </tbody>
    </table>
    `;
    return tablemarkup;
  }
}

const report = new Report();
module.exports = report;
