import { post } from '@/utils/request'

export const ProductIndex = data => {
    return post('/backend/product/index', data)
}

export const ProductPrice = data => {
    return post('/backend/product/price', data)
}

export const ProductStock = data => {
    return post('/backend/product/stock', data)
}

export const ProductTitle = data => {
    return post('/backend/product/title', data)
}

export const ProductContent = data => {
    return post('/backend/product/content', data)
}

export const ProductLabel = data => {
    return post('/backend/product/label', data)
}

export const ProductTheme = data => {
    return post('/backend/product/theme', data)
}

export const ProductSave = data => {
    return post('/backend/product/save', data)
}

export const ProductDelete = id => {
    return post('/backend/product/delete', { id })
}

export const ProductGroupIndex = data => {
    return post('/backend/product_group/index', data)
}

export const ProductGroupSave = data => {
    return post('/backend/product_group/save', data)
}

export const ProductGroupDelete = id => {
    return post('/backend/product_group/delete', { id })
}

export const ProductReleaseSave = data => {
    return post('/backend/product_release/save', data )
}

export const ProductContentPoolAssoc = () => {
    return post('/backend/product_content_pool/assoc', { } )
}

export const ProductContentPoolSave = data => {
    return post('/backend/product_content_pool/save', data )
}