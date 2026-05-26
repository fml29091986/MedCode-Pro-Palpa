-- ============================================================
-- SCRIPT DE DETECCIÓN DE ERRORES HIS - BD_HISINDICADORES
-- Oficina de Estadística e Informática - Hospital de Apoyo Palpa
-- Unidad Ejecutora 407 - DIRESA ICA
-- ============================================================
-- VERSION   : 2.0
-- ACTUALIZADO: Mayo 2026
-- BASE LEGAL : RM 550-2023 (Listado de Procedimientos),
--              Manual HIS Dengue 2016 (OGEI-MINSA),
--              Anexo N°1 CIE-10 MINSA (Códigos adicionales),
--              Anexo N°2 CIE-10 MINSA (Códigos cesados)
-- REGLAS    : R02–R29 (heredadas) + R30–R41 (nuevas)
-- ============================================================

DECLARE @ANIO INT = 2026
DECLARE @MES  INT = 5

-- Limpiar tabla temporal si existe
IF OBJECT_ID('tempdb..##TODOS_ERRORES') IS NOT NULL
    DROP TABLE ##TODOS_ERRORES

;WITH BASE AS (
    SELECT
        NT.Id_Cita,
        NT.Anio,
        NT.Mes,
        NT.Dia,
        Fecha_Atencion,
        NT.Lote,
        NT.Num_Pag,
        NT.Num_Reg,
        NT.Id_Establecimiento AS ID_EESS,
        ISNULL(E.Codigo_Unico, 'SIN DATO')          AS Renaes,
        ISNULL(E.Nombre_Establecimiento, 'SIN DATO') AS Establecimiento,
        NT.Id_Personal,
        NT.Id_Paciente,
        ISNULL(
            PER.Apellido_Paterno_Personal + ' ' +
            PER.Apellido_Materno_Personal + ', ' +
            PER.Nombres_Personal,
            'SIN DATO'
        )                                            AS Personal,
        NT.Tipo_Edad   AS T_Edad,
        NT.Edad_Reg    AS Edad,
        PAC.Id_Genero,
        NT.Id_Ups,
        NT.Id_Financiador,
        NT.Id_Condicion_Establecimiento AS Cond_eess,
        NT.Id_Condicion_Servicio        AS Cond_serv,
        NT.Codigo_Item                  AS DX,
        -- Descripción con fallback para códigos sin descripción en maestro
        NULLIF(CIE.Descripcion_Item, '')             AS Descripcion_DX,
        NT.Tipo_Diagnostico AS TD,
        NT.Valor_Lab        AS LC,
        NT.Id_Correlativo_Item,
        NT.Id_Correlativo_Lab,
        NT.Hemoglobina          AS HB,
        NT.Fecha_Solicitud_Hb   AS HB_Solicitud,
        NT.Fecha_Resultado_Hb   AS HB_Resultado,
        PAC.Id_Etnia            AS Etnia,
        NT.Peso,
        NT.Talla,
        NT.Perimetro_Abdominal  AS PAB,
        NT.Perimetro_Cefalico   AS PC,
        NT.Id_Centro_Poblado    AS IDCCPP,
        NT.gruporiesgo_desc     AS GRUPORIES,
        Fg_Tipo,
        PAC.Numero_Documento_Paciente  AS DNI,
        PER.Numero_Documento_Personal  AS DNI_Personal
    FROM dbo.NOMINAL_TRAMA_NUEVO NT
    LEFT JOIN dbo.MAESTRO_HIS_ESTABLECIMIENTO E
        ON NT.Id_Establecimiento = E.Id_Establecimiento
    LEFT JOIN dbo.MAESTRO_PERSONAL PER
        ON NT.Id_Personal = PER.Id_Personal
    LEFT JOIN dbo.MAESTRO_PACIENTE PAC
        ON NT.Id_Paciente = PAC.Id_Paciente
    LEFT JOIN dbo.MAESTRO_HIS_CIE_CPMS CIE
        ON NT.Codigo_Item = CIE.Codigo_Item
    WHERE NT.Anio = @ANIO AND NT.Mes = @MES
),

-- ============================================================
-- REGLAS HEREDADAS (R02–R29)
-- ============================================================

R02 AS (
    SELECT *, 'HEMOBLOGINA: SIN VALOR DE HB' AS Observacion
    FROM BASE
    WHERE DX IN ('85018','85018.01')
      AND ISNULL(CAST(HB AS FLOAT), 0) = 0
      AND (HB_Resultado IS NULL OR HB_Resultado = '')
),
R03 AS (
    SELECT *, 'HEMOGLOBINA: VALOR DE HB FUERA DE RANGO (< 4.0 o > 20.0)' AS Observacion
    FROM BASE
    WHERE DX IN ('85018','85018.01')
      AND ISNULL(CAST(HB AS FLOAT), 0) > 0
      AND (CAST(HB AS FLOAT) < 4.0 OR CAST(HB AS FLOAT) > 20.0)
),
R04 AS (
    SELECT *, 'ETNIA ----- Error en codigo de Etnia' AS Observacion
    FROM BASE
    WHERE Etnia IS NOT NULL
      AND TRY_CAST(Etnia AS INT) <> 58
),
R05 AS (
    SELECT *, 'MATERNO: Z349/359 SIN VALOR LAB' AS Observacion
    FROM BASE
    WHERE DX IN ('Z349','Z359')
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) IN ('','0'))
),
R07 AS (
    SELECT *, 'MATERNO: TIPO DE DIAGNOSTICO DEBE SER DEFINITIVO Y LAB DIFERENTE DE VACIO' AS Observacion
    FROM BASE
    WHERE DX IN ('Z3491','Z3591','Z349','Z359')
      AND (TD <> 'D' OR LC IS NULL OR CAST(LC AS NVARCHAR(20)) = '')
),
R08 AS (
    SELECT *, 'MATERNO Z3491/Z3591: TIPO DX DEBE SER DEFINITIVO Y 2do LAB DE 1 A 13' AS Observacion
    FROM BASE
    WHERE DX IN ('Z3491','Z3591')
      AND TD = 'D'
      AND Id_Correlativo_Lab = 2
      AND (LC IS NULL OR TRY_CAST(LC AS INT) IS NULL
           OR TRY_CAST(LC AS INT) < 1 OR TRY_CAST(LC AS INT) > 13)
),
R09 AS (
    SELECT *, 'MATERNO Z3493/Z3593: TIPO DX DEBE SER DEFINITIVO Y 2do LAB DE 28 A 42' AS Observacion
    FROM BASE
    WHERE DX IN ('Z3493','Z3593')
      AND TD = 'D'
      AND Id_Correlativo_Lab = 2
      AND (LC IS NULL OR TRY_CAST(LC AS INT) IS NULL
           OR TRY_CAST(LC AS INT) < 28 OR TRY_CAST(LC AS INT) > 42)
),
R11 AS (
    SELECT *, 'SUPLEMENTACION: VALOR LAB NO CORRESPONDE AL CODIGO 99199.17 (SUL-FER/HIE-POL 1,2,3,4,5,6,TA)' AS Observacion
    FROM BASE
    WHERE DX = '99199.17'
      AND (LC IS NULL OR LC NOT IN ('1','2','3','4','5','6','TA'))
      AND Id_Cita NOT IN (
            SELECT DISTINCT Id_Cita FROM BASE WHERE DX = 'C0011'
      )
),
R12 AS (
    SELECT *, 'SUPLEMENTACION: VALOR LAB NO CORRESPONDE AL CODIGO 99199.19 (MICRONUTRIENTES 1,2,3,4,5,6,TA)' AS Observacion
    FROM BASE
    WHERE DX = '99199.19'
      AND (LC IS NULL OR LC NOT IN ('1','2','3','4','5','6','TA'))
      AND Id_Cita NOT IN (
            SELECT DISTINCT Id_Cita FROM BASE WHERE DX = 'C0011'
      )
),
R13 AS (
    SELECT *, 'SUPLEMENTACION: VALOR LAB NO CORRESPONDE AL CODIGO 99199.26 (SUL-FE Y ACIDO FOLICO)' AS Observacion
    FROM BASE
    WHERE DX = '99199.26'
      AND (LC IS NULL OR LC NOT IN ('1','2','3','4','5','6','TA'))
      AND Id_Cita NOT IN (
            SELECT DISTINCT Id_Cita FROM BASE WHERE DX = 'C0011'
      )
),
R14 AS (
    SELECT *, 'SUPLEMENTACION: VALOR LAB NO CORRESPONDE AL CODIGO 99199.27 (VITAMINA A)' AS Observacion
    FROM BASE
    WHERE DX = '99199.27'
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) = ''
           OR UPPER(CAST(LC AS NVARCHAR(10))) NOT IN ('VA1','VA2','VA'))
),
R15 AS (
    SELECT *, 'PROFILAXIS ANTIPARASITARIA: VALOR LAB NO CORRESPONDE (debe ser 1 o 2)' AS Observacion
    FROM BASE
    WHERE DX = '99199.28'
      AND (LC IS NULL OR LC NOT IN ('1','2'))
),
R16 AS (
    SELECT *, 'Tamizaje de Presion Arterial - (99199.22)' AS Observacion
    FROM BASE
    WHERE DX = '99199.22'
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) = ''
           OR ISNULL(TRY_CAST(LC AS FLOAT), 0) = 0)
),
R17 AS (
    SELECT *, 'Z010 - EXAMEN DE OJOS Y DE LA VISION LAB N o A' AS Observacion
    FROM BASE
    WHERE DX = 'Z010'
      AND (LC IS NULL OR LC NOT IN ('N','A'))
),
R18 AS (
    SELECT *, 'Plan de Cuidado Integral de Salud - (99801): LAB debe ser 1, 2 o TA' AS Observacion
    FROM BASE
    WHERE DX = '99801'
      AND (LC IS NULL OR LC NOT IN ('1','2','TA'))
),
R19 AS (
    SELECT *, 'Consejeria Preventiva de Cancer (99402.08): LAB debe ser 1 o 2' AS Observacion
    FROM BASE
    WHERE DX = '99402.08'
      AND (LC IS NULL OR LC NOT IN ('1','2'))
),
R20 AS (
    SELECT *, 'Examen de Piel (Z128) - LAB N o A' AS Observacion
    FROM BASE
    WHERE DX = 'Z128'
      AND (LC IS NULL OR LC NOT IN ('N','A'))
),
R21 AS (
    SELECT *, 'DENTAL: SIN NUMERO DE PIEZAS (LC) - CODIGO REQUIERE VALOR LAB' AS Observacion
    FROM BASE
    WHERE DX IN ('D1206','D1330','D1310','D1208','D2391','K021','D1110','D7176','D2392','D1351')
      AND (LC IS NULL OR ISNULL(TRY_CAST(LC AS INT), 0) = 0) AND Id_Correlativo_Lab = '1'
),
R22 AS (
    SELECT *, 'DENTAL: TIPO DIAGNOSTICO DEBE SER DEFINITIVO (D) EN TRATAMIENTOS' AS Observacion
    FROM BASE
    WHERE FG_TIPO = 'CP'
      AND TD <> 'D'
      AND LEFT(CAST(DX AS NVARCHAR(10)), 2) IN ('D1','D2')
),
R23 AS (
    SELECT *, 'DENTAL: D0150 <> DE NUEVO o REINGRESANTE' AS Observacion
    FROM BASE
    WHERE LOTE <> 'SSB'
      AND TD = 'D'
      AND DX = 'D0150'
      AND Cond_serv = 'C'
),
R24 AS (
    SELECT *, 'OCULAR 99173: DETERMINACION DE LA AGUDEZA VISUAL SIN VALOR LAB' AS Observacion
    FROM BASE
    WHERE DX = '99173'
      AND (
            (Id_Correlativo_Lab = 1 AND LC IS NULL)
         OR (Id_Correlativo_Lab = 2 AND LC IS NULL)
      )
),
R25 AS (
    -- Códigos inactivos: CIE-10 MINSA Anexo 2 + otros cesados conocidos
    SELECT *, 'CODIGO INACTIVO / CESADO POR MINSA' AS Observacion
    FROM BASE
    WHERE DX IN (
        -- Hemorroides antiguas (I84x) - cesadas, usar K640-K649
        'I840','I841','I842','I843','I844','I845','I846','I847','I848','I849',
        -- Dengue antiguo - cesado, usar A970/A971/A972
        'A90X','A91X',
        -- Zika no especificado - cesado
        'U069',
        -- Identidad de género - cesados
        'F640','F641','F642','F648','F649','F651','F661',
        -- Otros previamente identificados
        'Z030','Z0143','U130'
    )
),
R26 AS (
    SELECT *, 'PROFAM: CONDICION ESTABLECIMIENTO Y SERVICIO DIFERENTE A CONTINUADOR' AS Observacion
    FROM BASE
    WHERE ID_UPS = '302101'
      AND (Cond_eess <> 'C' OR Cond_serv <> 'C')
      AND Lote NOT IN ('CAR','CED','CX1','JFV','SNU','SSB','SSM','WAT','WPF')
),
R27 AS (
    SELECT *, 'PROFAM: FINANCIADOR DIFERENTE DE OTROS' AS Observacion
    FROM BASE
    WHERE ID_UPS = '302101'
      AND ID_FINANCIADOR <> '10'
      AND Lote NOT IN ('CAR','CED','CX1','JFV','SNU','SSB','SSM','WAT','WPF')
),
R28 AS (
    SELECT *, 'ITS 86318.01: PRUEBA RAPIDA DUAL - SIN VALOR LAB' AS Observacion
    FROM BASE
    WHERE DX = '86318.01'
      AND (
            (Id_Correlativo_Lab = 1 AND LC IS NULL)
         OR (Id_Correlativo_Lab = 2 AND LC IS NULL)
      )
),
R29 AS (
    SELECT *, 'PACIENTES RECUPERADO CON TIPO DE DIAGNOSTICO DIFERENTE A REPETIDO' AS Observacion
    FROM BASE
    WHERE DX <> '99208'
      AND LC IN ('PR','PC')
      AND TD <> 'R'
),

-- ============================================================
-- REGLAS NUEVAS (R30–R41)
-- Fuentes: Manual HIS Dengue 2016, Anexo 1 y 2 CIE-10 MINSA,
--          RM550-2023 Listado de Procedimientos
-- ============================================================

-- ------------------------------------------------------------
-- R30: DENGUE - Registro incorrecto según Manual HIS 2016
-- El Manual establece que A970/A971/A972 deben tener:
--   - Tipo de diagnóstico "P" (probable) o "D" (confirmado)
--   - Si el LAB del 1er casillero tiene valor y no es PCR,
--     debe ser uno de: RN, EPI, 1,2,3,4 (serotipos PCR)
--     o vacío (para casos sin PCR)
--   - Valor fuera de rango = error de codificación
-- ------------------------------------------------------------
--R30 AS (
    --SELECT *,
        --'R30 DENGUE (A970/A971/A972): LAB 1er casillero con valor no válido. '
        --+ 'Permitidos: vacío, 1-4 (serotipo PCR), RN (negativo), EPI (nexo epidemiol.), G (gestante), P (puérpera)'
        --AS Observacion
    --FROM BASE
    --WHERE DX IN ('A970','A971','A972')
      --AND Id_Correlativo_Lab = 1
      --AND LC IS NOT NULL
      --AND UPPER(CAST(LC AS NVARCHAR(20))) NOT IN ('1','2','3','4','RN','EPI','G','P')
--),

-- ------------------------------------------------------------
-- R31: DENGUE - Toma de muestra (U2142) sin tipo de examen LAB
-- Según Manual 2016: el 2do casillero de U2142 debe registrar
-- el tipo de examen: PCR, AIS, IGM, IGG, NS1
-- ------------------------------------------------------------
R31 AS (
    SELECT *,
        'R31 DENGUE U2142 (TOMA DE MUESTRA): LAB debe indicar tipo de examen: PCR, AIS, IGM, IGG o NS1'
        AS Observacion
    FROM BASE
    WHERE DX = 'U2142'
      AND Id_Correlativo_Lab = '1'
      AND (
            LC IS NULL
         OR UPPER(CAST(LC AS NVARCHAR(20))) NOT IN ('PCR','AIS','IGM','IGG','NS1') AND id_cita IN (SELECT DISTINCT id_cita FROM BASE WHERE DX IN ('A970','A971','A972'))
      )
),

-- ------------------------------------------------------------
-- R32: DENGUE - Evaluación/Entrega de Resultados (U2625)
--      sin tipo de examen LAB registrado
-- ------------------------------------------------------------
R32 AS (
    SELECT *,
        'R32 DENGUE U2625 (ENTREGA RESULTADOS): LAB debe indicar tipo de examen: PCR, AIS, IGM, IGG o NS1'
        AS Observacion
    FROM BASE
    WHERE DX = 'U2625'
      AND Id_Correlativo_Lab = '1'
      AND (
            LC IS NULL
         OR UPPER(CAST(LC AS NVARCHAR(20))) NOT IN ('PCR','AIS','IGM','IGG','NS1') AND id_cita IN (SELECT DISTINCT id_cita FROM BASE WHERE DX IN ('A970','A971','A972'))
      )
),

-- ------------------------------------------------------------
-- R33: DENGUE - Administración de Tratamiento (U310)
--      sin número de tratamiento en LAB
-- Según Manual 2016: debe registrarse "1" para inicio
--                    o "TA" para fin de tratamiento
-- ------------------------------------------------------------
R33 AS (
    SELECT *,
        'R33 DENGUE U310 (ADMINISTRACION DE TRATAMIENTO): LAB debe ser 1 (inicio) o TA (fin de tratamiento)'
        AS Observacion
    FROM BASE
    WHERE DX = 'U310'
      AND Id_Correlativo_Lab = '1'
      AND (
            LC IS NULL
         OR UPPER(CAST(LC AS NVARCHAR(10))) NOT IN ('1','TA') AND id_cita IN (SELECT DISTINCT id_cita FROM BASE WHERE DX IN ('A970','A971','A972'))
      )
),

-- ------------------------------------------------------------
-- R34: SUPLEMENTACIÓN ÁCIDO FÓLICO (99199.18) - SIN VALOR LAB
-- Código activo en RM550-2023 | Regla similar a 99199.26
-- Valores válidos: 1,2,3,4,5,6,TA
-- ------------------------------------------------------------
R34 AS (
    SELECT *,
        'R34 SUPLEMENTACION ACIDO FOLICO (99199.18): LAB debe ser 1,2,3,4,5,6 o TA'
        AS Observacion
    FROM BASE
    WHERE DX = '99199.18'
      AND (LC IS NULL OR LC NOT IN ('1','2','3','4','5','6','TA'))
      AND Id_Cita NOT IN (
            SELECT DISTINCT Id_Cita FROM BASE WHERE DX = 'C0011'
      )
),

-- ------------------------------------------------------------
-- R35: ESTRATIFICACIÓN DE RIESGO CARDIOVASCULAR (99199.23)
--      sin resultado (N=Normal, A=Alterado, o nivel 1-4)
-- El tamizaje cardiovascular requiere resultado documentado
-- ------------------------------------------------------------
R35 AS (
    SELECT *,
        'R35 ESTRATIFICACION RIESGO CARDIOVASCULAR (99199.23): LAB no puede quedar vacío'
        AS Observacion
    FROM BASE
    WHERE DX = '99199.23'
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) = '')
),

-- ------------------------------------------------------------
-- R36: PRUEBA RÁPIDA TREPONEMA (86780.01)
--      sin resultado en LAB (N=No Reactivo, R=Reactivo)
-- Análogo a 86318.01; regla coherente con R28
-- ------------------------------------------------------------
R36 AS (
    SELECT *,
        'R36 PRUEBA RAPIDA TREPONEMA 86780.01: Sin valor LAB (se espera N=No Reactivo o R=Reactivo)'
        AS Observacion
    FROM BASE
    WHERE DX IN ('86780','86780.01')
      AND (
            (Id_Correlativo_Lab = 1 AND LC IS NULL)
         OR (Id_Correlativo_Lab = 2 AND LC IS NULL)
      )
),

-- ------------------------------------------------------------
-- R37: CRED / ATENCIÓN PREVENTIVA CON TIPO DX INCORRECTO
-- 99381–99387 (CRED, preventivas por etapa de vida):
-- Deben registrarse siempre con tipo de diagnóstico "D"
-- Registrar "P" en un control de CRED es incoherente
-- ------------------------------------------------------------
R37 AS (
    SELECT *,
        'R37 CRED/ATENCION PREVENTIVA (99381-99387): Tipo de Diagnóstico debe ser D (Definitivo), no '
        + ISNULL(CAST(TD AS NVARCHAR(5)),'vacío')
        AS Observacion
    FROM BASE
    WHERE DX IN (
        '99381','99381.01','99381.02','99381.03',
        '99382','99382.01',
        '99383','99383.01',
        '99384','99384.01','99384.02',
        '99385','99385.01','99385.02',
        '99386','99386.01','99386.02','99386.03','99386.04',
        '99387','99387.01',
        '99391','99392','99393','99394','99395','99396','99397'
    )
    AND TD <> 'D'
),

-- ------------------------------------------------------------
-- R38: CONSEJERÍA VECTORIAL (99402.15) SIN VALOR LAB
-- La consejería en control vectorial debe registrar si es
-- 1=primera sesión o TA=término, similar a otras consejerías
-- ------------------------------------------------------------
R38 AS (
    SELECT *,
        'R38 CONSEJERIA CONTROL VECTORIAL (99402.15): LAB no debe quedar vacío (registrar 1 o TA)'
        AS Observacion
    FROM BASE
    WHERE DX = '99402.15'
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) = '')
),

-- ------------------------------------------------------------
-- R39: CÓDIGOS DE TUBERCULOSIS SIN VALOR LAB REQUERIDO
-- 99199.08 (seguimiento clínico mensual): requiere LAB 1-6 o TA
-- 99199.11 (administración de tratamiento TB): requiere LAB
-- 99199.57 (censo de contactos) y 99199.58 (toma de muestra TB)
-- deben tener valor LAB registrado
-- ------------------------------------------------------------
R39 AS (
    SELECT *,
        'R39 TB (99199.08/99199.11/99199.57/99199.58): Código de TB sin valor LAB registrado'
        AS Observacion
    FROM BASE
    WHERE DX IN ('99199.08','99199.11','99199.57','99199.58')
      AND (LC IS NULL OR CAST(LC AS NVARCHAR(20)) = '')
),

-- ------------------------------------------------------------
-- R40: VISITA DOMICILIARIA (99341-99350, C0011) SIN NÚMERO
--      DE VISITA EN LAB
-- El Manual HIS establece que el número de visita (1, 2, 3…)
-- debe registrarse en el campo LAB; campo vacío = error
-- Se excluye 99344 porque ya la cubre el script original R24;
-- se amplía el espectro a todos los tipos de visita domiciliaria
-- ------------------------------------------------------------
/*
R40 AS (
    SELECT *,
        'R40 VISITA DOMICILIARIA (C0011/9934x): Sin número de visita registrado en LAB (1, 2, 3…)'
        AS Observacion
    FROM BASE
    WHERE DX IN (
        'C0011','C0011.01','C0011.02','C0011.03','C0011.04',
        '99341','99342','99343','99344','99345',
        '99347','99348','99349','99350'
    )
    AND (
          LC IS NULL
       OR ISNULL(TRY_CAST(LC AS INT), 0) = 0
    )
),
*/
-- ------------------------------------------------------------
-- R41: INCONGRUENCIA EDAD-CÓDIGO HIS
-- Detecta situaciones donde el código usado no corresponde
-- al rango etario del paciente registrado:
--   a) CRED neonato (99381.01) en paciente con T_Edad <> 'D'
--      (días) o Edad > 28 días
--   b) CRED < 1 año (99381) en paciente con T_Edad = 'A' y Edad >= 1
--   c) CRED 1–4 años (99382) en paciente con Edad < 1 o Edad >= 5
--      (cuando T_Edad = 'A')
--   d) CRED 5–11 años (99383) en paciente con Edad < 5 o Edad >= 12
--   e) CRED adolescente (99384) en paciente fuera de 12-17 años
-- ------------------------------------------------------------
R41 AS (
    SELECT *,
        CASE
            WHEN DX = '99381.01' AND (T_Edad <> 'D' OR ISNULL(TRY_CAST(Edad AS INT),99) > 28)
                THEN 'R41 INCONGRUENCIA EDAD-CODIGO: 99381.01 (CRED NEONATO) requiere edad en DIAS <= 28'
            WHEN DX IN ('99381','99381.02','99381.03')
                 AND T_Edad = 'A' AND ISNULL(TRY_CAST(Edad AS INT),0) >= 1
                THEN 'R41 INCONGRUENCIA EDAD-CODIGO: 99381 (CRED <1 AÑO) pero paciente tiene >= 1 año'
            WHEN DX IN ('99382','99382.01')
                 AND T_Edad = 'A'
                 AND (ISNULL(TRY_CAST(Edad AS INT),0) < 1 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 5)
                THEN 'R41 INCONGRUENCIA EDAD-CODIGO: 99382 (CRED 1-4 AÑOS) pero edad fuera de rango'
            WHEN DX IN ('99383','99383.01')
                 AND T_Edad = 'A'
                 AND (ISNULL(TRY_CAST(Edad AS INT),0) < 5 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 12)
                THEN 'R41 INCONGRUENCIA EDAD-CODIGO: 99383 (CRED 5-11 AÑOS) pero edad fuera de rango'
            WHEN DX IN ('99384','99384.01','99384.02')
                 AND T_Edad = 'A'
                 AND (ISNULL(TRY_CAST(Edad AS INT),0) < 12 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 18)
                THEN 'R41 INCONGRUENCIA EDAD-CODIGO: 99384 (CRED ADOLESCENTE 12-17) pero edad fuera de rango'
            ELSE 'R41 INCONGRUENCIA EDAD-CODIGO: Verificar rango etario'
        END AS Observacion
    FROM BASE
    WHERE
        -- Neonato
        (DX = '99381.01' AND (T_Edad <> 'D' OR ISNULL(TRY_CAST(Edad AS INT),99) > 28))
        OR
        -- CRED < 1 año
        (DX IN ('99381','99381.02','99381.03') AND T_Edad = 'A'
          AND ISNULL(TRY_CAST(Edad AS INT),0) >= 1)
        OR
        -- CRED 1-4
        (DX IN ('99382','99382.01') AND T_Edad = 'A'
          AND (ISNULL(TRY_CAST(Edad AS INT),0) < 1 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 5))
        OR
        -- CRED 5-11
        (DX IN ('99383','99383.01') AND T_Edad = 'A'
          AND (ISNULL(TRY_CAST(Edad AS INT),0) < 5 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 12))
        OR
        -- CRED Adolescente
        (DX IN ('99384','99384.01','99384.02') AND T_Edad = 'A'
          AND (ISNULL(TRY_CAST(Edad AS INT),0) < 12 OR ISNULL(TRY_CAST(Edad AS INT),0) >= 18))
),

-- ============================================================
-- UNIÓN FINAL DE TODAS LAS REGLAS
-- ============================================================
TODOS_ERRORES AS (
    SELECT * FROM R02  UNION ALL SELECT * FROM R03  UNION ALL SELECT * FROM R04
    UNION ALL SELECT * FROM R05  UNION ALL SELECT * FROM R07  UNION ALL SELECT * FROM R08
    UNION ALL SELECT * FROM R09  UNION ALL SELECT * FROM R11  UNION ALL SELECT * FROM R12
    UNION ALL SELECT * FROM R13  UNION ALL SELECT * FROM R14  UNION ALL SELECT * FROM R15
    UNION ALL SELECT * FROM R16  UNION ALL SELECT * FROM R17  UNION ALL SELECT * FROM R18
    UNION ALL SELECT * FROM R19  UNION ALL SELECT * FROM R20  UNION ALL SELECT * FROM R21
    UNION ALL SELECT * FROM R22  UNION ALL SELECT * FROM R23  UNION ALL SELECT * FROM R24
    UNION ALL SELECT * FROM R25  UNION ALL SELECT * FROM R26  UNION ALL SELECT * FROM R27
    UNION ALL SELECT * FROM R28  UNION ALL SELECT * FROM R29
    -- REGLAS NUEVAS
    /*UNION ALL SELECT * FROM R30*/  UNION ALL SELECT * FROM R31  UNION ALL SELECT * FROM R32
    UNION ALL SELECT * FROM R33  UNION ALL SELECT * FROM R34  UNION ALL SELECT * FROM R35
    UNION ALL SELECT * FROM R36  UNION ALL SELECT * FROM R37  UNION ALL SELECT * FROM R38
    UNION ALL SELECT * FROM R39  /*UNION ALL SELECT * FROM R40*/  UNION ALL SELECT * FROM R41
)

SELECT *
INTO ##TODOS_ERRORES
FROM TODOS_ERRORES;

-- ============================================================
-- CONSULTA 1: Todos los errores detectados
-- ============================================================
SELECT
    Renaes,
    Establecimiento,
    Anio,
    Mes,
    Dia,
    Fecha_Atencion,
    LOTE,
    Num_Pag,
    Num_Reg,
    Cond_eess,
    Cond_serv,
    DNI,
    T_Edad,
    Edad,
    Id_Genero,
    Id_Ups,
    Id_Financiador,
    TD,
    LC,
    DX,
    Descripcion_DX,
    Observacion,
    Id_Correlativo_Item,
    Id_Correlativo_Lab,
    Etnia,
    HB,
    HB_Resultado,
    PESO,
    TALLA,
    PAB,
    PC,
    FG_TIPO,
    DNI_Personal,
    Personal,
    Id_Cita
FROM ##TODOS_ERRORES
ORDER BY Renaes, Observacion, Fecha_Atencion, Id_Cita;

-- ============================================================
-- RESUMEN 1: Errores por establecimiento y tipo
-- ============================================================
/*
SELECT
    Establecimiento,
    Renaes,
    ISNULL(Observacion, 'SIN CLASIFICACION') AS TIPO_ERROR,
    COUNT(*)                                  AS N_ERRORES,
    COUNT(DISTINCT Id_Paciente)               AS PACIENTES_AFECTADOS,
    COUNT(DISTINCT Id_Personal)               AS PERSONAL_INVOLUCRADO,
    COUNT(DISTINCT DX)                        AS DIAGNOSTICOS_DISTINTOS,
    MIN(Fecha_Atencion)                       AS PRIMER_REGISTRO,
    MAX(Fecha_Atencion)                       AS ULTIMO_REGISTRO,
    DATEDIFF(DAY, MIN(Fecha_Atencion), MAX(Fecha_Atencion)) AS DIAS_DIFERENCIA
FROM ##TODOS_ERRORES
GROUP BY Renaes, Establecimiento, Observacion
ORDER BY Renaes, N_ERRORES DESC;

-- ============================================================
-- RESUMEN 2: Totales por establecimiento
-- ============================================================
SELECT
    Establecimiento,
    Renaes,
    COUNT(*)                         AS TOTAL_ERRORES,
    COUNT(DISTINCT Id_Paciente)      AS TOTAL_PACIENTES,
    COUNT(DISTINCT Id_Personal)      AS TOTAL_PERSONAL,
    COUNT(DISTINCT Observacion)      AS TIPOS_ERROR_DISTINTOS,
    COUNT(DISTINCT DX)               AS DIAGNOSTICOS_DISTINTOS,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ##TODOS_ERRORES)
         AS DECIMAL(5,2))            AS PCT_DEL_TOTAL,
    MIN(Fecha_Atencion)              AS FECHA_INICIO,
    MAX(Fecha_Atencion)              AS FECHA_FIN
FROM ##TODOS_ERRORES
GROUP BY Renaes, Establecimiento
ORDER BY TOTAL_ERRORES DESC;

-- ============================================================
-- RESUMEN 3: Totales por tipo de error (con clasificación nueva/heredada)
-- ============================================================
SELECT
    ISNULL(Observacion, 'SIN CLASIFICACION')  AS TIPO_ERROR,
    CASE
        WHEN LEFT(Observacion,2) IN ('HE','ET','MA','SU','PR','Ta','Z0',
                                     'Co','Ex','OC','DE','PR','IF','CO',
                                     'PA','IT','PL','PC')
          OR Observacion LIKE 'HEMOB%'
          OR Observacion LIKE 'HEMOD%'
          OR Observacion LIKE 'MATE%'
          OR Observacion LIKE 'PROF%'
          OR Observacion LIKE 'SUPL%'
          OR Observacion LIKE 'DENT%'
          OR Observacion LIKE 'OCUL%'
          OR Observacion LIKE 'COD%'
          OR Observacion LIKE 'ITS%'
          OR Observacion LIKE 'PAC%'
        THEN 'HEREDADA'
        ELSE 'NUEVA (v2.0)'
    END                                        AS CATEGORIA_REGLA,
    COUNT(*)                                   AS N_REGISTROS,
    COUNT(DISTINCT Renaes)                     AS EESS_AFECTADAS,
    COUNT(DISTINCT Id_Paciente)                AS PACIENTES,
    COUNT(DISTINCT Id_Personal)                AS PERSONAL_INVOLUCRADO,
    COUNT(DISTINCT DX)                         AS CODIGOS_DX_DISTINTOS,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ##TODOS_ERRORES)
         AS DECIMAL(5,2))                      AS PCT_TOTAL,
    MIN(Fecha_Atencion)                        AS PRIMER_ERROR,
    MAX(Fecha_Atencion)                        AS ULTIMO_ERROR
FROM ##TODOS_ERRORES
GROUP BY Observacion
ORDER BY N_REGISTROS DESC;

-- ============================================================
-- RESUMEN 4: Validación de integridad general
-- ============================================================
SELECT
    'RESUMEN GENERAL'                            AS CATEGORIA,
    COUNT(*)                                     AS TOTAL_ERRORES,
    COUNT(DISTINCT Renaes)                       AS EESS_AFECTADAS,
    COUNT(DISTINCT Id_Paciente)                  AS TOTAL_PACIENTES_CON_ERROR,
    COUNT(DISTINCT Id_Personal)                  AS PERSONAL_CON_ERROR,
    COUNT(DISTINCT Observacion)                  AS TIPOS_ERROR_UNICOS,
    COUNT(DISTINCT DX)                           AS CODIGOS_DIAGNOSTICOS
FROM ##TODOS_ERRORES;

DROP TABLE IF EXISTS ##TODOS_ERRORES;
*/