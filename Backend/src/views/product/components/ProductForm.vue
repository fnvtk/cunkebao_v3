<template>
  <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      v-loading="loading"
      width="868px"
      modal-append-to-body
      append-to-body
      destroy-on-close
      :close-on-press-escape="false">
    <div>
      <el-form :model="form" :rules="rules" ref="form" size="small" label-width="88px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入商品标题"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入商品描述"></el-input>
        </el-form-item>
        <el-form-item label="宝贝图片" prop="images">
          <div>
            <el-upload
                :action="uploadUrl"
                multiple
                list-type="picture-card"
                :file-list="images"
                :on-success="handleSuccess"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                accept="image/png, image/jpeg">
              <i class="el-icon-plus"></i>
            </el-upload>
            <div class="form-notice">只能上传jpg/png文件，且不超过1M</div>
          </div>
        </el-form-item>
        <el-form-item label="图片标签" prop="labels">
          <el-select
              v-model="form.labels"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请设置"
              style="width: 100%;">
          </el-select>
        </el-form-item>
        <el-form-item label="视频" prop="video">
          <div><el-button type="primary" icon="el-icon-upload2">上传</el-button></div>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input v-model="form.price" placeholder="￥0.00" style="width: 80%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input v-model="form.stock" placeholder="9999" style="width: 80%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!--<el-row>
          <el-col :span="12">
            <el-form-item label="运费" prop="shipping_fee">
              <el-input v-model="form.shipping_fee" placeholder="￥0.00, 不填写则为包邮" style="width: 80%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地点" prop="address">
              <el-input v-model="form.address" placeholder="" style="width: 80%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>-->
        <!--<el-form-item label="其他选项" prop="opts">
          <el-checkbox-group v-model="form.opts">
            <el-checkbox label="全新宝贝"></el-checkbox>
            <el-checkbox label="自提"></el-checkbox>
            <el-checkbox label="同城面交"></el-checkbox>
            <el-checkbox label="邮寄"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>-->
        <el-form-item label="宝贝主题" prop="themes">
          <el-select
              v-model="form.themes"
              multiple
              filterable
              allow-create
              placeholder="请设置"
              style="width: 100%;">
          </el-select>
        </el-form-item>
        <!--<el-form-item label="分类/品牌" prop="cb">
          <el-select
              v-model="form.cb"
              multiple
              filterable
              allow-create
              placeholder="请设置"
              style="width: 100%;">
          </el-select>
        </el-form-item>-->
        <el-form-item label="宝贝分组" prop="group_id">
          <el-select
              v-model="form.group_id"
              filterable
              placeholder="默认分组"
              style="width: 260px;">
            <el-option
                v-for="item in groups"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </el-dialog>
</template>

<script>

import config from '@/config/config'
import { ProductSave } from "@/api/product";
import { getToken } from '@/utils/auth'

export default {
  name: 'ProductForm',
  data() {
    return {
      loading: false,
      dialogShow: false,
      dialogVisible: false,
      dialogImageUrl: '',
      uploadUrl: '',
      title: '',
      form: { opts: [], labels: ['点头像+'], cb: [], themes: [], images: [] },
      rules: {
        title: [
          { required: true, message: '请输入商品标题', trigger: 'blur' },
        ],
        content: [
          { required: true, message: '请输入商品描述', trigger: 'blur' },
        ],
        images: [
          { required: true, message: '请上传商品图片', trigger: 'blur' },
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        stock: [
          { required: true, message: '请输入商品库存', trigger: 'blur' },
        ],
      },
      images: [],
      groups: [],
    };
  },
  created() {
    this.uploadUrl = config.BASE_API_URL + '/backend/upload?token=' + getToken()
  },
  methods: {
    handleSuccess(res, file, fileList) {
      if (res && res.name && res.url) {
        this.form.images.push(res)
      }
    },
    handleRemove(file, fileList) {
      var images = []
      for (var i = 0; i < this.form.images.length; i ++) {
        if (this.form.images[i].name != file.name) {
          images.push(this.form.images[i])
        }
      }
      this.form.images = images
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          ProductSave(this.form).then(ret => {
            this.loading = false
            if (ret.code == 200) {
              this.$message.success(ret.msg)
              this.$emit('fetch-data')
              this.close()
            } else {
              this.$message.error(ret.msg);
            }
          }).catch(e => {
            this.loading = false
            this.$message.error(e.message);
          })
        } else {
          return false;
        }
      })
    },
    show(row, groups) {
      this.groups = groups
      if (row) {
        this.title      = '修改商品'
        this.dialogShow = true
        this.form       = Object.assign({}, row, { group_id: row.group_id ? row.group_id : '' })
        this.images     = [].concat(this.form.images)
      } else {
        this.title      = '添加商品'
        this.dialogShow = true
        this.form       = { opts: [], labels: ['点头像+'], cb: [], themes: [], images: [] }
        this.images     = []
      }
    },
    close() {
      this.dialogShow = false
      this.$refs['form'].resetFields()
      this.form = this.$options.data().form
    },
  }
}
</script>

<style scoped>

</style>