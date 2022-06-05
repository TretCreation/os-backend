const sequelize = require('../db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
        // allowNull: false, - NOT NULL
    },
    email: {
        type: DataTypes.STRING, // DataTypes.TEXT
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "USER" // 'USER'
    }
});

const Cart = sequelize.define('cart', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
});

const CartProduct = sequelize.define('cart_product', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
});

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING, 
        unique:true, 
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,    
        allowNull: false
    },
    rating: {
        type: DataTypes.STRING, 
        defaultValue: 0
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const Type = sequelize.define('type', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true, 
        allowNull: false
    }
});

const Brand = sequelize.define('brand', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true, 
        allowNull: false
    }
});

const Rating = sequelize.define('rating', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
    rate: {
        type: DataTypes.STRING, 
        allowNull: false
    }
});

const ProductInfo = sequelize.define('product_info', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const TypeBrand = sequelize.define('type_brand', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey:true,
        autoIncrement: true
    }
})

User.hasOne(Cart);
Cart.belongsTo(User);

User.hasMany(Rating);
Rating.belongsTo(User);

Cart.hasMany(CartProduct) 
CartProduct.belongsTo(Cart)

Type.hasMany(Product)
Product.belongsTo(Type)

Brand.hasMany(Product)
Product.belongsTo(Brand)

Product.hasMany(Rating)
Rating.belongsTo(Product)

Product.hasMany(CartProduct)
CartProduct.belongsTo(Product)

Product.hasMany(ProductInfo, {as: 'info'});
ProductInfo.belongsTo(Product)

Type.belongsToMany(Brand, {through: TypeBrand })
Brand.belongsToMany(Type, {through: TypeBrand })

module.exports = {
    User,
    Cart,
    CartProduct,
    Product,
    Type,
    Brand,
    Rating,
    TypeBrand,
    ProductInfo
}

// https://sequelize.org/docs/v6/core-concepts/assocs/
