"""
Extraction et transformation des données ONI depuis la page NOAA.

"""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path
import re



PERIODS = (
    "DJF", 
    "JFM", 
    "FMA",
    "MAM", 
    "AMJ",
    "MJJ",
    "JJA",
    "JAS",
    "ASO",  
    "SON",
    "OND", 
    "NDJ", 
)

DEFAULT_SOURCE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "Climate Prediction Center - ONI.html"
)


@dataclass(frozen=True)
class ONIObservation:

    date_centrale: date
    periode: str
    valeur_oni: Decimal


class _TableRowsParser(HTMLParser):
    """Extracteur des lignes et colonnes du tableau HTML."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.rows: list[list[str]] = []
        self._row: list[str] | None = None
        self._cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "tr":
            self._row = []
        elif tag == "td" and self._row is not None:
            self._cell = []

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "td" and self._row is not None and self._cell is not None:
            self._row.append("".join(self._cell).strip())
            self._cell = None
        elif tag == "tr" and self._row is not None:
            self.rows.append(self._row)
            self._row = None
            self._cell = None


def parse_oni_html(content: str) -> list[ONIObservation]:
    """
    Transforme le contenu HTML NOAA en observations exploitables.

    Étapes :
    1. Extraire le tableau : lignes et colonnes brutes du HTML.
    2. Filtrer les lignes d'année : reconnaître YYYY dans la première cellule.
    3. Transformer chaque cellule en observation : (année, période) → date centrale.
    4. Valider : nombres décimaux, pas de doublons.
    """
    parser = _TableRowsParser()
    parser.feed(content)

    observations: list[ONIObservation] = []
    seen_dates: set[date] = set()
    year_rows_found = 0

    for row in parser.rows:
        # ignore vides ou sans année en première cellule
        if not row or re.fullmatch(r"\d{4}", row[0]) is None:
            continue

        # ignore les lignes avec trop de colonnes 
        if len(row) > len(PERIODS) + 1:
            continue

        year_rows_found += 1
        year_str = row[0]

        # Si la ligne est incomplète, ajouter des chaînes vides pour l'aligner
        values = row[1:] + [""] * (len(PERIODS) - len(row[1:]))

        # une observation pour chaque période et valeur
        for month_number, (period, raw_value) in enumerate(zip(PERIODS, values), start=1):
            if not raw_value:
                continue

            # validation et conversion en Decimal
            try:
                value = Decimal(raw_value)
            except InvalidOperation as error:
                raise ValueError(
                    f"Valeur ONI invalide pour {period} {year_str} : {raw_value!r}"
                ) from error

            if not value.is_finite():
                raise ValueError(
                    f"Valeur ONI non finie pour {period} {year_str} : {raw_value!r}"
                )

            central_date = date(int(year_str), month_number, 1)

            if central_date in seen_dates:
                raise ValueError(f"Observation ONI en double : {central_date}")

            observations.append(
                ONIObservation(
                    date_centrale=central_date,
                    periode=period,
                    valeur_oni=value,
                )
            )
            seen_dates.add(central_date)

    if year_rows_found == 0:
        raise ValueError("Aucune ligne annuelle du tableau ONI n'a été trouvée.")

    return observations


def read_oni_file(source: Path = DEFAULT_SOURCE) -> list[ONIObservation]:
    content = source.read_text(encoding="utf-8-sig")
    return parse_oni_html(content)


if __name__ == "__main__":
    observations = read_oni_file()
    print(f"Observations transformées : {len(observations)}")
    if observations:
        print(f"Première observation : {observations[0]}")
        print(f"Dernière observation : {observations[-1]}")
