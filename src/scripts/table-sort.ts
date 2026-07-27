function getCellValue(
  row: HTMLTableRowElement,
  index: number,
) {
  return (
    row.cells[index]?.textContent?.trim() ??
    ""
  );
}

function detectType(value: string) {
  if (!value) return "string";

  const trimmed = value.trim();
  const cleanNum = trimmed.replace(/,/g, "");
  if (cleanNum !== "" && !isNaN(Number(cleanNum))) {
    return "number";
  }

  if (isNaN(Number(trimmed)) && !isNaN(Date.parse(trimmed))) {
    return "date";
  }

  return "string";
}

function compareValues(a: string, b: string, type: string) {
  switch (type) {
    case "number": {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
      return numA - numB;
    }

    case "date":
      return new Date(a).getTime() - new Date(b).getTime();

    default:
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  }
}

export function makeTableSortable(tableId: string) {
  const table = document.getElementById(tableId) as HTMLTableElement | null;
  if (!table) return;

  const headers = Array.from(table.querySelectorAll("thead th"));

  let sortColumn = -1;
  let ascending = true;

  headers.forEach((header, columnIndex) => {
    header.classList.add("sortable");

    header.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll("tr"));
      if (rows.length === 0) return;

      if (sortColumn === columnIndex) {
        ascending = !ascending;
      } else {
        ascending = true;
        sortColumn = columnIndex;
      }

      headers.forEach((h) => {
        h.classList.remove("sort-asc");
        h.classList.remove("sort-desc");
      });

      header.classList.add(ascending ? "sort-asc" : "sort-desc");

      let sampleValue = "";
      for (const row of rows) {
        const val = getCellValue(row as HTMLTableRowElement, columnIndex);
        if (val !== "") {
          sampleValue = val;
          break;
        }
      }

      const type = detectType(sampleValue);

      rows.sort((rowA, rowB) => {
        const valueA = getCellValue(rowA as HTMLTableRowElement, columnIndex);
        const valueB = getCellValue(rowB as HTMLTableRowElement, columnIndex);
        const result = compareValues(valueA, valueB, type);
        return ascending ? result : -result;
      });

      rows.forEach((row) => tbody.appendChild(row));
    });
  });
}