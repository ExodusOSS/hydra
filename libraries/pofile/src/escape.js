/**
 * Serialization-time escaping for values stored in raw PO-escaped form.
 *
 * Values parsed from .po files keep their escape sequences byte-for-byte
 * because runtime translation ids are computed from that raw form, so
 * backslashes pass through untouched. Only characters that would break the
 * quoted line are escaped: double quotes and literal line breaks or tabs.
 */
const escapeRawValue = (value) =>
  value
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\t', '\\t')

module.exports = { escapeRawValue }
