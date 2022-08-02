# Extract RDS information using glue

## npm install

```bash
npm install
```

## デプロイ

```shell
npx cdk deploy --all -c env=dev --require-aproval never
```

## RDSのテーブル設定

起動したLinuxサーバにSSM接続し、[create_usertable.sql](./create_usertable.sql)を実行する

## ブログリンク

[Glueを使ってRDSからPinpointのセグメント情報を抽出してみた | DevelopersIO](https://dev.classmethod.jp/articles/extract-pinpoint-segment-information-using-glue/)
