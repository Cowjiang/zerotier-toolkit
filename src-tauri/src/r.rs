use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct R<T>
where
    T: Serialize,
{
    code: i8,
    message: String,
    data: T,
}

pub(crate) fn success<T>(data: T) -> R<T>
where
    T: Serialize,
{
    R {
        code: 0,
        message: String::from("success"),
        data,
    }
}

#[allow(unused)]
pub(crate) fn fail<T>(data: T) -> R<T>
where
    T: Serialize,
{
    R {
        code: -1,
        message: String::from("fail"),
        data,
    }
}

pub(crate) fn success_json<T>(data: T) -> String
where
    T: Serialize,
{
    let result = success(data);
    serde_json::to_string(&result).unwrap()
}

pub(crate) fn fail_message_json(message: &str) -> String {
    let result = fail_message(message);
    serde_json::to_string(&result).unwrap()
}

#[allow(unused)]
pub(crate) fn fail_json() -> String {
    let result = fail_message("fail");
    serde_json::to_string(&result).unwrap()
}

pub(crate) fn fail_message(message: &str) -> R<Option<String>> {
    R {
        code: -1,
        message: String::from(message),
        data: None,
    }
}

#[cfg(test)]
mod tests {
    use crate::r::success;

    #[test]
    fn test_success() {
        let r = success("123".to_string());
        print!("{:?}", r)
    }
}
