onmessage = (e) => {
  console.log('-------------->onmessage child', e)
  const result = JSON.stringify({
    message: 'did you receive it'
  })
  postMessage(result)
}