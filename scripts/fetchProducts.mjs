import sanityClient from '@sanity/client'

const client = sanityClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
})

async function main(){
  try{
    const res = await client.fetch(`*[_type == "product"]{_id,title,price,category,description,stock,sizes,images}`)
    console.log(JSON.stringify(res, null, 2))
  }catch(e){
    console.error('ERROR', e.message || e)
    process.exit(1)
  }
}

main()
