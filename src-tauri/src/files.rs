use std::fs;
use std::path::Path;

/// Grava `contents` no arquivo escolhido pelo usuário, criando ou substituindo-o.
pub fn write_text(path: &Path, contents: &str) -> Result<(), String> {
    if path.as_os_str().is_empty() {
        return Err("Caminho de arquivo vazio.".into());
    }

    if path.is_dir() {
        return Err("O caminho escolhido é uma pasta, não um arquivo.".into());
    }

    fs::write(path, contents).map_err(|e| format!("Não foi possível gravar o arquivo: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_path(name: &str) -> std::path::PathBuf {
        std::env::temp_dir().join(format!("indie-copilot-{}-{name}", std::process::id()))
    }

    #[test]
    fn writes_and_overwrites_a_file() {
        let path = temp_path("write.json");

        write_text(&path, "{\"a\":1}").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"a\":1}");

        write_text(&path, "{\"b\":2}").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"b\":2}");

        fs::remove_file(&path).unwrap();
    }

    #[test]
    fn preserves_non_ascii_content() {
        let path = temp_path("utf8.json");

        write_text(&path, "{\"título\":\"Ação\"}").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "{\"título\":\"Ação\"}");

        fs::remove_file(&path).unwrap();
    }

    #[test]
    fn rejects_an_empty_path() {
        assert!(write_text(Path::new(""), "x").is_err());
    }

    #[test]
    fn rejects_a_directory() {
        let error = write_text(&std::env::temp_dir(), "x").unwrap_err();
        assert!(error.contains("pasta"));
    }

    #[test]
    fn reports_a_missing_parent_folder() {
        let path = temp_path("missing-dir").join("nested").join("file.json");
        let error = write_text(&path, "x").unwrap_err();
        assert!(error.starts_with("Não foi possível gravar o arquivo"));
    }
}
