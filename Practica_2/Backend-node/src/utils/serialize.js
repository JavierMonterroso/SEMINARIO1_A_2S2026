// PostgreSQL TIMESTAMPTZ se representa igual en ambos backends: UTC con milisegundos.
function row(value) {
  if (!value) return value;
  return { ...value, created_at: new Date(value.created_at).toISOString() };
}

module.exports = { row };
