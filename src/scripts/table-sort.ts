function getCellValue(
  row: HTMLTableRowElement,
  index: number,
) {
  return (
    row.cells[index]?.textContent?.trim() ??
    ""
  );
}

function detectType(
  value: string,
) {
  if (
    !isNaN(Date.parse(value))
  ) {
    return "date";
  }

  const number =
    value.replace(
      /[^0-9.-]/g,
      "",
    );

  if (
    number &&
    !isNaN(Number(number))
  ) {
    return "number";
  }

  return "string";
}

function compareValues(
  a: string,
  b: string,
  type: string,
) {
  switch (type) {
    case "number":
      return (
        Number(
          a.replace(
            /[^0-9.-]/g,
            "",
          ),
        ) -
        Number(
          b.replace(
            /[^0-9.-]/g,
            "",
          ),
        )
      );

    case "date":
      return (
        new Date(
          a,
        ).getTime() -
        new Date(
          b,
        ).getTime()
      );

    default:
      return a.localeCompare(
        b,
        undefined,
        {
          sensitivity:
            "base",
        },
      );
  }
}

export function makeTableSortable(
  tableId: string,
) {
  const table =
    document.getElementById(
      tableId,
    ) as HTMLTableElement | null;

  if (!table) {
    return;
  }

  const headers =
    Array.from(
      table.querySelectorAll(
        "thead th",
      ),
    );

  let sortColumn = -1;
  let ascending = true;

  headers.forEach(
    (
      header,
      columnIndex,
    ) => {
      header.classList.add(
        "sortable",
      );

      header.addEventListener(
        "click",
        () => {
          const tbody =
            table.querySelector(
              "tbody",
            );

          if (!tbody) {
            return;
          }

          const rows =
            Array.from(
              tbody.querySelectorAll(
                "tr",
              ),
            );

          if (
            rows.length === 0
          ) {
            return;
          }

          if (
            sortColumn ===
            columnIndex
          ) {
            ascending =
              !ascending;
          } else {
            ascending = true;
            sortColumn =
              columnIndex;
          }

          headers.forEach(
            (h) => {
              h.classList.remove(
                "sort-asc",
              );
              h.classList.remove(
                "sort-desc",
              );
            },
          );

          header.classList.add(
            ascending
              ? "sort-asc"
              : "sort-desc",
          );

          const type =
            detectType(
              getCellValue(
                rows[0] as HTMLTableRowElement,
                columnIndex,
              ),
            );

          rows.sort(
            (rowA, rowB) => {
              const valueA =
                getCellValue(
                  rowA as HTMLTableRowElement,
                  columnIndex,
                );

              const valueB =
                getCellValue(
                  rowB as HTMLTableRowElement,
                  columnIndex,
                );

              const result =
                compareValues(
                  valueA,
                  valueB,
                  type,
                );

              return ascending
                ? result
                : -result;
            },
          );

          rows.forEach(
            (row) =>
              tbody.appendChild(
                row,
              ),
          );
        },
      );
    },
  );
}