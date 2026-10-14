using System.Text.RegularExpressions;

namespace StudioManagement.Application.Common;

public static class NumberNormalizer
{
    private static readonly string[] ArabicDigits = { "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩" };
    private static readonly string[] PersianDigits = { "۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹" };

    /// <summary>
    /// Converts any Eastern Arabic digits (٠-٩) or Persian digits (۰-۹) into standard Latin/English digits (0-9).
    /// Safe for null, empty or already English strings.
    /// </summary>
    public static string NormalizeDigits(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var result = input;
        for (int i = 0; i <= 9; i++)
        {
            result = result.Replace(ArabicDigits[i], i.ToString());
            result = result.Replace(PersianDigits[i], i.ToString());
        }
        return result.Trim();
    }

    /// <summary>
    /// Tries to parse an integer from input after normalizing Arabic/Eastern digits.
    /// </summary>
    public static bool TryParseNormalizedInt(string? input, out int value)
    {
        var normalized = NormalizeDigits(input);
        return int.TryParse(normalized, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out value);
    }

    /// <summary>
    /// Tries to parse a decimal from input after normalizing Arabic/Eastern digits and Arabic comma separator.
    /// </summary>
    public static bool TryParseNormalizedDecimal(string? input, out decimal value)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            value = 0;
            return false;
        }
        var normalized = NormalizeDigits(input)
            .Replace("،", ".")
            .Replace(",", ".");
        return decimal.TryParse(normalized, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out value);
    }
}
