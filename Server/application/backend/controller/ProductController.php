<?php

namespace app\backend\controller;

use app\common\model\ProductGroupModel;
use app\common\model\ProductModel;
use think\db\Query;

class ProductController extends BaseLoginController {

    /**
     * 获取列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $groupId   = trim($this->request->param('group_id'));
        $isUsed    = trim($this->request->param('is_used'));
        $keywords  = trim($this->request->param('keywords'));
        $pageNo    = intval($this->request->param('page'));
        $pageSize  = intval($this->request->param('pageSize'));
        if ($pageNo <= 0) {
            $pageNo = 1;
        }
        if ($pageSize <= 0) {
            $pageSize = 30;
        }

        $query = ProductModel::where(1);
        if (strlen($groupId) > 0) {
            $query->where('group_id', $groupId);
        }
        if (isset(ProductModel::isUsedAssoc()[$isUsed])) {
            $query->where('is_used', $isUsed);
        }
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('title', '%' . $keywords . '%', 'OR');
            });
        }

        $totalCount = $query->count();
        $pageCount  = $totalCount > 0 ? ceil($totalCount / $pageSize) : 1;
        if ($pageNo > $pageCount) {
            $pageNo = $pageCount;
        }

        $query->order('id', 'DESC');
        $query->limit(($pageNo - 1) * $pageSize, $pageSize);

        $list = [];
        foreach ($query->select() as $model) {
            $images = [];
            foreach ($model->images as $image) {
                $images[] = array_merge($image, [
                    'url' => $this->absoluteUrl($image['path']),
                ]);
            }

            $list[] = array_merge($model->toArray(), [
                'images'       => $images,
                'is_used_name' => ProductModel::isUsedAssoc()[$model->is_used],
                'group_name'   => isset(ProductGroupModel::assoc()[$model->group_id])
                    ? ProductGroupModel::assoc()[$model->group_id]
                    : '',
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'groups'     => $this->assocToList(ProductGroupModel::assoc()),
            'isUseds'    => $this->assocToList(ProductModel::isUsedAssoc()),
        ]);
    }

    /**
     * 批量修改主题
     *
     * @return \think\response\Json
     */
    public function theme() {
        $checked = $this->request->param('checked');
        $themes  = $this->request->param('themes');
        if (empty($checked)
                OR !is_array($checked)) {
            return $this->jsonFail('参数错误');
        }

        if (empty($themes) OR !is_array($themes)) {
            $themes = [];
        }

        ProductModel::where(1)
            ->whereIn('id', $checked)
            ->update([
                'themes'      => json_encode($themes, JSON_UNESCAPED_UNICODE),
                'update_time' => time(),
            ]);

        return $this->jsonSucc();
    }

    /**
     * 批量修改标签
     *
     * @return \think\response\Json
     */
    public function label() {
        $checked = $this->request->param('checked');
        $labels  = $this->request->param('labels');
        if (empty($checked)
                OR !is_array($checked)) {
            return $this->jsonFail('参数错误');
        }

        if (empty($labels) OR !is_array($labels)) {
            $labels = [];
        }

        ProductModel::where(1)
            ->whereIn('id', $checked)
            ->update([
                'labels'      => json_encode($labels, JSON_UNESCAPED_UNICODE),
                'update_time' => time(),
            ]);

        return $this->jsonSucc();
    }

    /**
     * 批量修改标题
     *
     * @return \think\response\Json
     */
    public function title() {
        $checked = $this->request->param('checked');
        $type    = intval($this->request->param('type'));
        $title   = trim($this->request->param('title'));
        if (empty($checked)
                OR !is_array($checked)
                OR !in_array($type, [0, 1])
                OR empty($title)) {
            return $this->jsonFail('参数错误');
        }

        foreach (ProductModel::where(1)
                ->whereIn('id', $checked)
                ->select() as $model) {
            if ($type == 0) {
                $model->title = $model->title . $title;
            } else {
                $model->title = $title . $model->title;
            }
            $model->save();
        }

        return $this->jsonSucc();
    }

    /**
     * 批量修改描述
     *
     * @return \think\response\Json
     */
    public function content() {
        $checked = $this->request->param('checked');
        $type    = intval($this->request->param('type'));
        $content = trim($this->request->param('content'));
        if (empty($checked)
                OR !is_array($checked)
                OR !in_array($type, [0, 1])
                OR empty($content)) {
            return $this->jsonFail('参数错误');
        }

        foreach (ProductModel::where(1)
                     ->whereIn('id', $checked)
                     ->select() as $model) {
            if ($type == 0) {
                $model->content = $model->content . "\n" . $content;
            } else {
                $model->content = $content . "\n" . $model->content;
            }
            $model->save();
        }

        return $this->jsonSucc();
    }

    /**
     * 批量修改库存
     *
     * @return \think\response\Json
     */
    public function stock() {
        $checked = $this->request->param('checked');
        $stock   = intval($this->request->param('stock'));
        if (empty($checked)
                OR !is_array($checked)) {
            return $this->jsonFail('参数错误');
        }

        if ($stock <= 0) {
            return $this->jsonFail('库存不可小于1');
        }

        ProductModel::where(1)
            ->whereIn('id', $checked)
            ->update([
                'stock'       => $stock,
                'update_time' => time(),
            ]);

        return $this->jsonSucc();
    }

    /**
     * 批量修改价格
     *
     * @return \think\response\Json
     */
    public function price() {
        $checked = $this->request->param('checked');
        $type    = intval($this->request->param('type'));
        $rate    = floatval($this->request->param('rate'));
        $val     = floatval($this->request->param('val'));
        $price   = floatval($this->request->param('price'));
        if (empty($checked)
                OR !is_array($checked)
                OR !in_array($type, [0, 1, 2])) {
            return $this->jsonFail('参数错误');
        }

        if ($type == 0 OR $type == 1) {
            if ($rate <= 0 AND $val <= 0) {
                return $this->jsonFail('请输入比例或数值');
            }
        } elseif ($type == 2) {
            if ($price <= 0) {
                return $this->jsonFail('请输入金额');
            }
        }

        foreach (ProductModel::where(1)
                ->whereIn('id', $checked)
                ->select() as $model) {
            if ($type == 0) {
                if ($rate > 0) {
                    $model->price -= $model->price * $rate / 100;
                } else {
                    $model->price -= $val;
                }
            } elseif ($type == 1) {
                if ($rate > 0) {
                    $model->price += $model->price * $rate / 100;
                } else {
                    $model->price += $val;
                }
            } elseif ($type == 2) {
                $model->price = $price;
            }
            $model->price = round($model->price, 2);
            if ($model->price > 0) {
                $model->save();
            }
        }

        return $this->jsonSucc();
    }

    /**
     * 保存
     *
     * @return \think\response\Json
     */
    public function save() {
        $id          = intval($this->request->param('id'));
        $groupId     = intval($this->request->param('group_id'));
        $title       = trim($this->request->param('title'));
        $content     = trim($this->request->param('content'));
        $cb          = $this->request->param('cb');
        $images      = $this->request->param('images');
        $labels      = $this->request->param('labels');
        $themes      = $this->request->param('themes');
        $opts     = $this->request->param('opts');
        $address     = trim($this->request->param('address'));
        $price       = floatval($this->request->param('price'));
        $stock       = intval($this->request->param('stock'));
        $shippingFee = floatval($this->request->param('shipping_fee'));
        $video       = trim($this->request->param('video'));
        if (empty($title)
                OR $groupId < 0
                OR empty($content)
                OR !is_array($cb)
                OR !is_array($images)
                OR empty($images)
                OR !is_array($labels)
                OR !is_array($themes)
                OR !is_array($opts)
                OR $price < 0
                OR $stock < 0
                OR $shippingFee < 0) {
            return $this->jsonFail('参数错误');
        }

        foreach ($images as $i => $image) {
            unset($images[$i]['url']);
        }

        if (!empty($id)) {
            $model = ProductModel::get($id);
            if (empty($model)) {
                return $this->jsonFail('对象未找到');
            }
        } else {
            $model = new ProductModel();
        }

        $model->group_id = $groupId;
        $model->title = $title;
        $model->content = $content;
        $model->cb      = $cb;
        $model->video   = $video;
        $model->images = $images;
        $model->labels = $labels;
        $model->themes = $themes;
        $model->address = $address;
        $model->price = $price;
        $model->stock = $stock;
        $model->shipping_fee = $shippingFee;
        $model->opts = $opts;
        $model->save();

        return $this->jsonSucc();
    }

    /**
     * 删除
     *
     * @return \think\response\Json
     * @throws \Exception
     */
    public function delete() {
        $id = intval($this->request->param('id'));
        if (empty($id)) {
            return $this->jsonFail('参数错误');
        }

        $model = ProductModel::get($id);
        if (empty($model)) {
            return $this->jsonFail('对象未找到');
        }

        $model->delete();

        return $this->jsonSucc();
    }
}