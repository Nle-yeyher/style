import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/stylesavvy';

// Mapa de URLs viejas (picsum) a nuevas (Unsplash) basado en tu placeholder-images.json
const imageMap = [
  // Camisetas
  { old: /picsum\.photos\/seed\/style1/, new: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style2/, new: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style3/, new: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style4/, new: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style5/, new: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style6/, new: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style7/, new: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=800&fit=crop' },
  { old: /picsum\.photos\/seed\/style8/, new: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop' },
  // Cualquier otra URL de picsum que quede
  { old: /picsum\.photos\/seed\/coll/, new: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop' },
];

async function updateImages() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const collection = db.collection('products');

    // Buscar todos los productos con URLs de picsum
    const picsumProducts = await collection.find({
      imageUrl: { $regex: 'picsum', $options: 'i' }
    }).toArray();

    console.log(`🔍 Encontrados ${picsumProducts.length} productos con URLs de picsum`);

    if (picsumProducts.length === 0) {
      console.log('✨ No hay productos con URLs de picsum. ¡Todo está bien!');
      return;
    }

    let updated = 0;
    let notMapped = 0;

    for (const product of picsumProducts) {
      const oldUrl = product.imageUrl;
      let newUrl = null;

      // Buscar si hay un mapeo específico
      for (const mapping of imageMap) {
        if (mapping.old.test(oldUrl)) {
          newUrl = mapping.new;
          break;
        }
      }

      // Si no hay mapeo específico, asignar una URL genérica de Unsplash
      if (!newUrl) {
        newUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop';
        notMapped++;
      }

      await collection.updateOne(
        { _id: product._id },
        { $set: { imageUrl: newUrl } }
      );

      console.log(`  ✔ ${product.name || product._id}: ${oldUrl} → ${newUrl}`);
      updated++;
    }

    console.log(`\n🎉 Actualizados: ${updated} productos`);
    if (notMapped > 0) {
      console.log(`⚠️  ${notMapped} productos no tenían mapeo exacto y se les asignó imagen genérica`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

updateImages();
