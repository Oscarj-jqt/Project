CREATE TABLE oni (
    date_centrale DATE PRIMARY KEY,
    periode TEXT NOT NULL CHECK (
        periode IN ('DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ',
                    'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ')
    ),
    valeur_oni NUMERIC NOT NULL,
    CHECK (EXTRACT(DAY FROM date_centrale) = 1),
    CHECK (
        EXTRACT(MONTH FROM date_centrale) = array_position(
            ARRAY['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ',
                  'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'],
            periode
        )
    )
);
