from datetime import date
from decimal import Decimal

import pytest

from etl.load import get_database_url
from etl.oni import parse_oni_html, read_oni_file


def test_loader_uses_configured_database_and_escapes_password(monkeypatch) -> None:
    monkeypatch.setenv("POSTGRES_HOST", "db")
    monkeypatch.setenv("POSTGRES_PORT", "5433")
    monkeypatch.setenv("POSTGRES_DB", "climate")
    monkeypatch.setenv("POSTGRES_USER", "climate_user")
    monkeypatch.setenv("POSTGRES_PASSWORD", "a@b/c")

    assert get_database_url() == "postgresql://climate_user:a%40b%2Fc@db:5433/climate"


def test_transforms_year_row_into_month_centered_observations() -> None:
    html = """
    <table>
      <tr><td>Year</td><td>DJF</td><td>JFM</td></tr>
      <tr><td>2026</td><td>-0.4</td><td>-0.2</td></tr>
    </table>
    """

    observations = parse_oni_html(html)

    assert len(observations) == 2
    assert observations[0].date_centrale == date(2026, 1, 1)
    assert observations[0].periode == "DJF"
    assert observations[0].valeur_oni == Decimal("-0.4")
    assert observations[1].date_centrale == date(2026, 2, 1)
    assert observations[1].periode == "JFM"
    assert observations[1].valeur_oni == Decimal("-0.2")


def test_ignores_empty_cells_in_the_latest_year_row() -> None:
    html = """
    <table>
      <tr><td>Year</td><td>DJF</td><td>JFM</td><td>FMA</td></tr>
      <tr><td>2026</td><td>-0.4</td><td></td><td>0.1</td></tr>
    </table>
    """

    observations = parse_oni_html(html)

    assert [(item.periode, item.valeur_oni) for item in observations] == [
        ("DJF", Decimal("-0.4")),
        ("FMA", Decimal("0.1")),
    ]


def test_rejects_non_numeric_oni_value() -> None:
    html = """
    <table>
      <tr><td>2026</td><td>invalid</td></tr>
    </table>
    """

    with pytest.raises(ValueError, match="Valeur ONI invalide"):
        parse_oni_html(html)


def test_extracts_reference_values_from_saved_noaa_page() -> None:
    observations = read_oni_file()

    assert observations[0].date_centrale == date(1950, 1, 1)
    assert observations[0].periode == "DJF"
    assert observations[0].valeur_oni == Decimal("-1.3")
    assert observations[-1].date_centrale == date(2026, 9, 1)
    assert observations[-1].periode == "ASO"
    assert observations[-1].valeur_oni == Decimal("2.5")
