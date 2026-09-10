export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A'
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
}

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}